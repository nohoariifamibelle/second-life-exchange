import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

/**
 * Tests end-to-end pour le contrôleur d'authentification
 * Vérifie le comportement complet de l'API d'inscription utilisateur
 */
describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    // Création du module de test avec toutes les dépendances
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Activer la validation globale (comme en production)
    // whitelist: supprime les propriétés non définies dans le DTO
    // forbidNonWhitelisted: rejette les requêtes avec des propriétés non autorisées
    // transform: convertit automatiquement les types
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Récupération de la connexion MongoDB pour les nettoyages et vérifications
    connection = moduleFixture.get<Connection>(getConnectionToken());
  }, 30000); // Augmenter le timeout à 30 secondes

  afterAll(async () => {
    // Nettoyer la base de données de test
    if (connection.readyState === 1) {
      await connection.dropDatabase();
      await connection.close();
    }
    await app.close();
  });

  afterEach(async () => {
    // Nettoyer les utilisateurs après chaque test
    if (connection.readyState === 1) {
      const collections = connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  describe('POST /auth/register', () => {
    // Données d'un utilisateur valide utilisées comme base pour les tests
    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    // Test du cas nominal : inscription réussie
    it('should create a new user and return 201', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201)
        .expect((res) => {
          // Vérification que l'utilisateur est bien créé avec toutes les propriétés attendues
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('email', validUser.email);
          expect(res.body).toHaveProperty('firstName', validUser.firstName);
          expect(res.body).toHaveProperty('lastName', validUser.lastName);
          expect(res.body).toHaveProperty('isActive', true);
          // Sécurité : le mot de passe ne doit JAMAIS être retourné dans la réponse
          expect(res.body).not.toHaveProperty('password');
        });
    });

    // Test de sécurité : prévention des doublons d'email
    it('should return 409 if email already exists', async () => {
      // Première inscription réussie
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      // Tentative de deuxième inscription avec le même email
      // Doit retourner un conflit (409) pour empêcher les doublons
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Cet email est déjà utilisé');
        });
    });

    // Test de validation : format d'email incorrect
    it('should return 400 if email is invalid', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          email: 'invalid-email',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([expect.stringContaining('Email invalide')]),
          );
        });
    });

    // Test de validation : mot de passe trop simple
    it('should return 400 if password is too weak', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'weak', // Mot de passe trop court et sans complexité
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([expect.stringContaining('mot de passe')]),
          );
        });
    });

    // Test de validation : champs obligatoires manquants
    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password, firstName, lastName
        })
        .expect(400);
    });

    // Test de sécurité CRITIQUE : vérification du hachage du mot de passe
    it('should not store plain text password in database', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      // Vérification directe dans la base de données
      const usersCollection = connection.collection('users');
      const user = await usersCollection.findOne({ email: validUser.email });

      expect(user).toBeDefined();
      // Le mot de passe ne doit JAMAIS être stocké en clair
      expect(user.password).not.toBe(validUser.password);
      // Vérification du format bcrypt : $2a$ ou $2b$ suivi de 56 caractères
      expect(user.password).toMatch(/^\$2[ab]\$.{56}$/);
    });

    // Test de validation : email manquant spécifiquement
    it('should return 400 if email is missing', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([expect.stringContaining('email')]),
          );
        });
    });

    // Test de validation : complexité du mot de passe
    it('should return 400 if password does not meet complexity requirements', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          // Mot de passe sans majuscule, sans chiffre et sans caractère spécial
          password: 'password',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              expect.stringContaining('mot de passe doit contenir'),
            ]),
          );
        });
    });

    // Test de formatage : nettoyage des espaces blancs
    it('should trim whitespace from email and names', async () => {
      // Données avec des espaces blancs au début et à la fin
      const userWithSpaces = {
        email: '  test@example.com  ',
        password: 'Password123!',
        firstName: '  John  ',
        lastName: '  Doe  ',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userWithSpaces)
        .expect(201);

      // L'email doit être nettoyé (trimmed) et en minuscules
      expect(response.body.email).toBe('test@example.com');
      // Les noms doivent être nettoyés (trimmed)
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
    });
  });
});
