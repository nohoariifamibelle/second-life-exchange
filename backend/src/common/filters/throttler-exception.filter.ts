import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

/**
 * Filtre d'exception personnalisé pour le rate limiting (OWASP A04)
 * Retourne un message d'erreur clair avec le temps d'attente restant
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Récupérer le temps d'attente depuis les headers si disponible
    const retryAfter = response.getHeader('Retry-After');
    const retryAfterSeconds = retryAfter ? Number(retryAfter) : 60;

    // Calculer le temps d'attente en minutes pour l'affichage
    const minutes = Math.ceil(retryAfterSeconds / 60);
    const timeMessage =
      minutes > 1 ? `${minutes} minutes` : `${retryAfterSeconds} secondes`;

    // Identifier l'endpoint pour un message plus contextualisé
    const path = request.url || '';
    let contextMessage = 'Trop de tentatives.';

    if (path.includes('/auth/login')) {
      contextMessage = 'Trop de tentatives de connexion.';
    } else if (path.includes('/auth/register')) {
      contextMessage = "Trop de tentatives d'inscription.";
    }

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'Too Many Requests',
      message: `${contextMessage} Réessayez dans ${timeMessage}.`,
      retryAfter: retryAfterSeconds,
    });
  }
}
