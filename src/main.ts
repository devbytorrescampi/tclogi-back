import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Same prefix Core and Backend-POS use — the ecosystem gateway's rewrites
  // route /api/tclogi/* here assuming this prefix (see docs/agregar-vertical-nueva.md).
  // 'health' stays excluded so it resolves at the bare /health — that's the
  // URL Render/UptimeRobot ping directly against this service's own domain
  // (tclogi-back.onrender.com/health), never through the gateway rewrite.
  app.setGlobalPrefix('api/tclogi', { exclude: ['health'] });
  // credentials: true — required so the browser sends the ecosystem-wide
  // `accessToken` cookie set by TCSoft's Core across origins.
  app.enableCors({ origin: true, credentials: true });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
