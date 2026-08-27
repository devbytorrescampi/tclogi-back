import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Tries TCLogi's own local login first, then falls back to a TCSoft
// Core-issued (RS256/JWKS) token — see core-jwt.strategy.ts. Passport tries
// each strategy in order and succeeds on the first one that validates.
@Injectable()
export class JwtAuthGuard extends AuthGuard(['jwt', 'core-jwt']) {
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
