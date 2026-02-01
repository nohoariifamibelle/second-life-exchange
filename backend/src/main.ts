import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { sanitizeMiddleware, ThrottlerExceptionFilter } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Activer CORS - supporte plusieurs origines séparées par des virgules
  const corsOriginConfig =
    configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  const corsOrigins = corsOriginConfig
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Activer les headers de sécurité (compatible avec CORS)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );

  // Protection contre les injections NoSQL (OWASP A03:2021)
  // Supprime les opérateurs MongoDB malveillants ($gt, $ne, $where, etc.)
  app.use(sanitizeMiddleware);

  // Filtre global pour les erreurs de rate limiting (OWASP A04)
  // Retourne un message d'erreur clair avec le temps d'attente
  app.useGlobalFilters(new ThrottlerExceptionFilter());

  // Activer la validation globale avec transformation des types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retire les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
      transform: true, // Transforme les types (nécessaire pour @Transform decorators)
    }),
  );

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
void bootstrap();
