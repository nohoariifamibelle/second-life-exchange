import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'mongo-sanitize';

/**
 * Sanitize récursivement un objet en appliquant mongo-sanitize
 * Préserve les caractères spéciaux légitimes (accents, apostrophes, etc.)
 */
function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as T;
  }

  if (typeof obj === 'object') {
    // mongo-sanitize supprime les clés commençant par $ ou contenant .
    // mais préserve les valeurs légitimes
    return mongoSanitize(obj) as T;
  }

  return obj;
}

/**
 * Sanitize les propriétés d'un objet en place (pour les objets read-only comme req.query)
 */
function sanitizeInPlace(obj: Record<string, any>): void {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    const sanitized = sanitizeObject(obj[key]);
    if (obj[key] !== sanitized) {
      obj[key] = sanitized;
    }
  }
}

/**
 * Middleware Express pour la protection contre les injections NoSQL.
 * À utiliser avec app.use() dans main.ts
 *
 * @example
 * // Dans main.ts
 * import { sanitizeMiddleware } from './common';
 * app.use(sanitizeMiddleware);
 */
export function sanitizeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Sanitize body (POST/PUT/PATCH data)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters (GET ?param=value)
  // Note: req.query est read-only dans Express 5+, on modifie les propriétés individuellement
  if (req.query && typeof req.query === 'object') {
    sanitizeInPlace(req.query as Record<string, any>);
  }

  // Sanitize route parameters (/route/:id)
  // Note: req.params peut aussi être read-only selon la configuration
  if (req.params && typeof req.params === 'object') {
    sanitizeInPlace(req.params as Record<string, any>);
  }

  next();
}

/**
 * Middleware NestJS de sanitization contre les injections NoSQL.
 * Applique mongo-sanitize sur req.body, req.query et req.params
 * pour supprimer les opérateurs MongoDB malveillants ($gt, $ne, etc.)
 *
 * @example
 * // Dans un module
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(SanitizeMiddleware).forRoutes('*');
 *   }
 * }
 */
@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    sanitizeMiddleware(req, res, next);
  }
}