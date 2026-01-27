// Décorateur Injectable + type ExecutionContext
import { Injectable, ExecutionContext } from '@nestjs/common';
// Guard Passport pour la sécurisation des routes
import { AuthGuard } from '@nestjs/passport';
// Réflexion pour récupérer les métadonnées des routes
import { Reflector } from '@nestjs/core';
// Observable pour les streams RxJS
import { Observable } from 'rxjs';

/**
 * Guard JWT utilisé pour sécuriser les routes
 * associées au guard AuthGuard('jwt')
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Constructeur du guard JWT
   * @param reflector - Réflexion pour récupérer les métadonnées des routes
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Méthode appelée pour vérifier si la requête est autorisée
   * @param context - Contexte de l'exécution
   * @returns true si la requête est autorisée, false sinon
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Récupère les métadonnées de la route
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
