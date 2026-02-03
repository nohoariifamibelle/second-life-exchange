import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { UploadModule } from './upload/upload.module';
import { AiModule } from './ai/ai.module';
import { StatsModule } from './stats/stats.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration globale des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuration MongoDB avec variables d'environnement
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting - Protection contre les attaques par force brute (OWASP A04)
    // Configuration avec plusieurs niveaux de limites par IP
    ThrottlerModule.forRoot([
      {
        // Limite courte : 15 requêtes par seconde (burst protection)
        name: 'short',
        ttl: 1000,
        limit: 15,
      },
      {
        // Limite moyenne : 60 requêtes par 10 secondes
        name: 'medium',
        ttl: 10000,
        limit: 60,
      },
      {
        // Limite longue : 200 requêtes par minute (limite par défaut)
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ]),

    // Module commun avec SecurityLoggerService (OWASP A09)
    CommonModule,

    UsersModule,

    AuthModule,

    ItemsModule,

    ExchangesModule,

    UploadModule,

    AiModule,

    StatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Activer le ThrottlerGuard globalement
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
