import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Tenant } from '../tenants/tenant.entity';
import { Plan } from '../plans/plan.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { CoreJwtStrategy } from './core-jwt.strategy';

// Login local (JwtStrategy/AuthController/AuthService, JWT_SECRET propio)
// eliminado — TCLogi todavía no tenía usuarios reales, así que no hizo
// falta el período de convivencia dual que sí ameritó Backend-POS (que
// tenía usuarios reales en producción). CoreJwtStrategy es ahora el único
// camino de autenticación — ver jwt-auth.guard.ts.
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Plan, Subscription]),
    PassportModule,
  ],
  providers: [CoreJwtStrategy],
})
export class AuthModule {}
