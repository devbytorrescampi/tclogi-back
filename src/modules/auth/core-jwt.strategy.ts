import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Plan, PlanFeatures } from '../plans/plan.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

// Cuánto se confía en el mirror local antes de volver a pedirle a Core el
// plan/estado actual — evita un round-trip a Core en cada request
// autenticado, mismo espíritu que ya aplica Core con su propio JWKS
// cacheado y el chequeo de suscripción solo en login/refresh.
const SUBSCRIPTION_SYNC_TTL_MS = 5 * 60 * 1000;

// Shape de GET /subscriptions/me en Core — ver
// tcsoft-gateway-back/src/modules/subscriptions/subscriptions.controller.ts.
interface CoreSubscription {
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  pauseReason: string | null;
  plan: {
    id: string;
    name: string;
    trialDays: number;
    features: { maxUsers?: number; extra?: Record<string, boolean | number> };
  };
}

function extractFromAccessTokenCookie(req: Request): string | null {
  return req?.cookies?.['accessToken'] || null;
}

export interface CoreJwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  // Core's own role vocabulary (ADMIN/SUPERVISOR/OPERATOR/STAFF) — a
  // different taxonomy from TCLogi's fleet-specific UserRole below, kept as
  // `string` here on purpose so the two are never confused as the same enum.
  role: string;
  tokenVersion: number;
}

/**
 * Second identity source alongside TCLogi's own local login (`jwt.strategy.ts`):
 * validates access tokens issued by TCSoft's Core (`tcsoft-gateway-back`),
 * signed RS256 and published as a JWKS at `CORE_JWKS_URL`
 * (`.../api/auth/.well-known/jwks.json`). Lets a user who already logged in
 * once at the ecosystem gateway land in TCLogi already authenticated,
 * without a shared secret or a round-trip to Core per request — same
 * pattern Backend-POS uses (see TCSoft docs, `Backend-POS/src/modules/auth/jwt.strategy.ts`).
 *
 * TCLogi's own `users`/`tenants` tables stay the source of truth for
 * in-app data (fleet role, drivers, vehicles, ...); this strategy only
 * mirrors the minimum needed to satisfy those tables' FKs the first time a
 * given Core identity is seen here. Core's `role` (ADMIN/SUPERVISOR/OPERATOR/
 * STAFF) is only used to pick a sensible default TCLogi role on first
 * mirror — it is never used to overwrite a role a TCLogi admin already
 * assigned via the Team page.
 */
@Injectable()
export class CoreJwtStrategy extends PassportStrategy(Strategy, 'core-jwt') {
  private readonly coreAuthUrl: string;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
    @InjectRepository(Subscription) private readonly subscriptionRepo: Repository<Subscription>,
    private readonly configService: ConfigService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractFromAccessTokenCookie,
      ]),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        // No getOrThrow: CORE_JWKS_URL is optional until TCLogi is actually
        // wired into the ecosystem gateway. Falling back to an unreachable
        // placeholder means this strategy simply fails (401) per-request
        // instead of crashing the whole app at boot when unset.
        jwksUri: configService.get<string>('CORE_JWKS_URL', 'http://core-jwks-not-configured.invalid'),
      }),
    });
    this.coreAuthUrl = configService.get<string>('CORE_AUTH_URL', '');
  }

  private async findOrMirrorTenant(tenantId: string): Promise<void> {
    const existing = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (existing) return;
    // Real name/slug live in Core — this row only exists to satisfy
    // TCLogi's own local FKs (User.tenantId, and everything downstream).
    const tenant = this.tenantRepo.create({
      id: tenantId,
      name: 'Empresa TCSoft',
      slug: `core-${tenantId.slice(0, 8)}`,
      isActive: true,
      onboardingCompleted: true,
    });
    await this.tenantRepo.save(tenant);
  }

  /**
   * Trae plan/estado de Core (GET /subscriptions/me — acepta cualquier
   * token RS256 válido de Core, no hace falta ServiceAuthGuard) y lo
   * mirrorea en la Subscription/Plan locales, para que FeatureGuard
   * (que sigue leyendo el mirror local, no Core directo) tenga
   * planFeatures actualizado. Se salta el fetch si el mirror local
   * todavía está fresco (ver SUBSCRIPTION_SYNC_TTL_MS) — no falla la
   * request si Core no responde, solo sigue con lo que haya en el
   * mirror (puede estar desactualizado, pero no bloquea el login).
   */
  private async syncSubscriptionFromCore(tenantId: string, bearerToken: string): Promise<void> {
    const existing = await this.subscriptionRepo.findOne({ where: { tenantId } });
    const isFresh =
      existing?.lastSyncedAt &&
      Date.now() - existing.lastSyncedAt.getTime() < SUBSCRIPTION_SYNC_TTL_MS;
    if (isFresh || !this.coreAuthUrl) return;

    try {
      const res = await fetch(`${this.coreAuthUrl}/subscriptions/me`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      if (!res.ok) return;
      const coreSub = (await res.json()) as CoreSubscription;

      let plan = await this.planRepo.findOne({ where: { id: coreSub.plan.id } });
      const features: PlanFeatures = {
        maxUsers: coreSub.plan.features.maxUsers ?? 0,
        maxWarehouses: 0,
        maxVehicles: 0,
        maxShipmentsPerMonth: 0,
        hasCustomsModule: false,
        hasMultiWarehouseTransfers: false,
        hasRealtimeTracking: false,
        hasReports: false,
        // Las 7 features específicas de logística viajan en
        // features.extra del lado de Core (ver Plan.features de Core) —
        // se sobrescriben los defaults de arriba con lo que venga ahí.
        ...(coreSub.plan.features.extra ?? {}),
      };

      if (!plan) {
        plan = this.planRepo.create({
          id: coreSub.plan.id,
          name: coreSub.plan.name,
          trialDays: coreSub.plan.trialDays,
          features,
        });
      } else {
        plan.name = coreSub.plan.name;
        plan.trialDays = coreSub.plan.trialDays;
        plan.features = features;
      }
      await this.planRepo.save(plan);

      const subscription =
        existing ??
        this.subscriptionRepo.create({ tenantId, planId: plan.id });
      subscription.planId = plan.id;
      subscription.status = coreSub.status as SubscriptionStatus;
      subscription.trialEndsAt = coreSub.trialEndsAt ? new Date(coreSub.trialEndsAt) : null;
      subscription.currentPeriodEnd = coreSub.currentPeriodEnd ? new Date(coreSub.currentPeriodEnd) : null;
      subscription.pauseReason = coreSub.pauseReason ?? null as unknown as string;
      subscription.lastSyncedAt = new Date();
      await this.subscriptionRepo.save(subscription);
    } catch {
      // Core inalcanzable — se sigue con el mirror local tal como está,
      // en vez de tumbar el login por un problema transitorio de red.
    }
  }

  async validate(req: Request, payload: CoreJwtPayload) {
    if (!payload?.sub || !payload?.tenantId) {
      throw new UnauthorizedException();
    }

    await this.findOrMirrorTenant(payload.tenantId);

    let user = await this.userRepo.findOne({ where: { id: payload.sub } });

    if (!user) {
      user = this.userRepo.create({
        id: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
        fullName: payload.email,
        // Inert placeholder — Core already validated the real password;
        // TCLogi never checks this field for a Core-mirrored user.
        passwordHash: crypto.randomBytes(32).toString('hex'),
        role: payload.role === 'ADMIN' ? UserRole.ADMIN : UserRole.WAREHOUSE_OPERATOR,
        isActive: true,
      });
      user = await this.userRepo.save(user);
    } else if (!user.isActive) {
      throw new UnauthorizedException();
    } else if (user.tenantId !== payload.tenantId) {
      // Identity drifted at Core (shouldn't normally happen) — keep in sync.
      user.tenantId = payload.tenantId;
      user = await this.userRepo.save(user);
    }

    const bearerToken =
      ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? extractFromAccessTokenCookie(req);
    if (bearerToken) {
      await this.syncSubscriptionFromCore(payload.tenantId, bearerToken);
    }
    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId: payload.tenantId },
      relations: { plan: true },
    });

    return {
      id: user.id,
      tenantId: user.tenantId,
      subscriptionStatus: subscription?.status,
      planFeatures: subscription?.plan?.features,
      email: user.email,
      role: user.role,
    };
  }
}
