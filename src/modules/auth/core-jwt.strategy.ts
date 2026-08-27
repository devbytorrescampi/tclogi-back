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
import { UserRole } from '../../common/enums/user-role.enum';

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
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    configService: ConfigService,
  ) {
    super({
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

  async validate(payload: CoreJwtPayload) {
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

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };
  }
}
