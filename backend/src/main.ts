import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Activer la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retire les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, //Rejette les requêtes avec des propriétés non autorisées
      transform: true, // Transforme les types automatiquement
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
