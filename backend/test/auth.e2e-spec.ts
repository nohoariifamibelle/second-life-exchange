import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Activer la validation globale (comme en production)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

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
    const validUser = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a new user and return 201', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('email', validUser.email);
          expect(res.body).toHaveProperty('firstName', validUser.firstName);
          expect(res.body).toHaveProperty('lastName', validUser.lastName);
          expect(res.body).toHaveProperty('isActive', true);
          expect(res.body).not.toHaveProperty('password'); // Password should not be returned
        });
    });

    it('should return 409 if email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Cet email est déjà utilisé');
        });
    });

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

    it('should return 400 if password is too weak', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'weak',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              expect.stringContaining('mot de passe'),
            ]),
          );
        });
    });

    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password, firstName, lastName
        })
        .expect(400);
    });

    it('should not store plain text password in database', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      // Verify in database
      const usersCollection = connection.collection('users');
      const user = await usersCollection.findOne({ email: validUser.email });

      expect(user).toBeDefined();
      expect(user.password).not.toBe(validUser.password); // Should be hashed
      expect(user.password).toMatch(/^\$2[ab]\$.{56}$/); // bcrypt hash format
    });

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

    it('should return 400 if password does not meet complexity requirements', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...validUser,
          password: 'password', // No uppercase, number, or special char
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

    it('should trim whitespace from email and names', async () => {
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

      // Email should be trimmed and lowercase
      expect(response.body.email).toBe('test@example.com');
      // Names should be trimmed
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
    });
  });
});
