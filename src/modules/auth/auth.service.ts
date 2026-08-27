import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Plan } from '../plans/plan.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant) private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async registerTenant(dto: RegisterTenantDto) {
    const plan = await this.planRepo.findOneOrFail({
      where: { id: dto.planId },
    });

    const slug = dto.companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

    const existing = await this.tenantRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Ya existe una empresa con ese nombre');
    }

    return this.dataSource.transaction(async (manager) => {
      const tenant = await manager.save(Tenant, {
        name: dto.companyName,
        slug,
        onboardingCompleted: true,
      });

      const passwordHash = await bcrypt.hash(dto.adminPassword, 10);
      const user = await manager.save(User, {
        tenantId: tenant.id,
        fullName: dto.adminFullName,
        email: dto.adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      });

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays);

      await manager.save(Subscription, {
        tenantId: tenant.id,
        planId: plan.id,
        status: SubscriptionStatus.TRIAL,
        trialEndsAt,
      });

      return this.buildTokens(user);
    });
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }
    return this.buildTokens(user);
  }

  private buildTokens(user: User) {
    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      tokenVersion: user.tokenVersion,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
