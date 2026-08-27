import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid session');
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session expired');
    }

    const subscription = await this.subscriptionRepo.findOne({
      where: { tenantId: user.tenantId },
      order: { createdAt: 'DESC' },
    });
    if (subscription?.status === SubscriptionStatus.SUSPENDED) {
      throw new UnauthorizedException({
        code: 'SUBSCRIPTION_SUSPENDED',
        message: subscription.pauseReason ?? 'Subscription suspended',
      });
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      subscriptionStatus: subscription?.status,
      planFeatures: subscription?.plan?.features,
    };
  }
}
