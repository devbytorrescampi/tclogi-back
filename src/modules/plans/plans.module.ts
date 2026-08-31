import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './plan.entity';

// Sin controller propio: Core (tcsoft-gateway-back) es la fuente de
// verdad de planes desde la migración a Core-only auth — GET /plans
// (público, para el registro local que ya no existe) fue eliminado.
// El repo de Plan queda registrado acá solo para las FKs de negocio que
// lo referencian localmente (mirror de solo-lectura, ver
// core-jwt.strategy.ts).
@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  exports: [TypeOrmModule],
})
export class PlansModule {}
