import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Suite de tests end-to-end pour l'AppController
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  // Préparation de l'environnement de test avant chaque test
  beforeEach(async () => {
    // Crée un module de test avec tous les imports nécessaires
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Crée une instance de l'application NestJS
    app = moduleFixture.createNestApplication();
    // Initialise l'application NestJS et démarre tous les services, middlewares et guards
    await app.init();
  });

  /*Ce test s'assure que l'application démarre correctement et répond aux requêtes*/
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/') // Effectue une requête GET sur la route racine
      .expect(200) // Vérifie que le statut HTTP est 200
      .expect('Hello World!'); // Vérifie que la réponse contient "Hello World!"
  });
});
