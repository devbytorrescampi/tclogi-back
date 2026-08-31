import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Validates the TCSoft Core-issued (RS256/JWKS) token — see
// core-jwt.strategy.ts. TCLogi's own local login was removed (no real
// users depended on it yet); this is now the only auth path.
@Injectable()
export class JwtAuthGuard extends AuthGuard('core-jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
