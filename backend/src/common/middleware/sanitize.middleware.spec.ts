import { Request, Response } from 'express';
import { sanitizeMiddleware } from './sanitize.middleware';

describe('NoSQL Injection Sanitization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should remove MongoDB operators from body', () => {
    mockRequest.body = {
      email: { $gt: '' },
      password: { $ne: null },
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    // Les opérateurs $ doivent être supprimés
    expect(mockRequest.body.email).not.toHaveProperty('$gt');
    expect(mockRequest.body.password).not.toHaveProperty('$ne');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should remove MongoDB operators from query params', () => {
    mockRequest.query = {
      search: { $where: 'malicious code' },
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.query.search).not.toHaveProperty('$where');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should preserve legitimate French characters', () => {
    mockRequest.body = {
      description: "Très beau vélo d'occasion",
      city: 'Saint-Étienne',
      bio: "J'adore échanger des objets!",
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.body.description).toBe("Très beau vélo d'occasion");
    expect(mockRequest.body.city).toBe('Saint-Étienne');
    expect(mockRequest.body.bio).toBe("J'adore échanger des objets!");
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should preserve special characters in legitimate data', () => {
    mockRequest.body = {
      title: 'iPhone 12 Pro - 128Go',
      price: '450€',
      description: 'État: comme neuf! Contact: email@test.com',
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.body.title).toBe('iPhone 12 Pro - 128Go');
    expect(mockRequest.body.price).toBe('450€');
    expect(mockRequest.body.description).toBe(
      'État: comme neuf! Contact: email@test.com',
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle nested objects', () => {
    mockRequest.body = {
      user: {
        name: 'Jean-Pierre',
        address: {
          city: 'Lyon',
          injected: { $gt: '' },
        },
      },
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.body.user.name).toBe('Jean-Pierre');
    expect(mockRequest.body.user.address.city).toBe('Lyon');
    expect(mockRequest.body.user.address.injected).not.toHaveProperty('$gt');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should handle arrays', () => {
    mockRequest.body = {
      tags: ['vélo', 'occasion', { $ne: null }],
      ids: ['123', '456'],
    };

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockRequest.body.tags[0]).toBe('vélo');
    expect(mockRequest.body.tags[1]).toBe('occasion');
    expect(mockRequest.body.ids).toEqual(['123', '456']);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should call next() even with empty request', () => {
    mockRequest.body = undefined;
    mockRequest.query = undefined;
    mockRequest.params = undefined;

    sanitizeMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction).toHaveBeenCalled();
  });
});
