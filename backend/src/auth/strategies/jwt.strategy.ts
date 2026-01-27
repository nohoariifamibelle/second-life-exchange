// Décorateurs et exceptions NestJS
import { Injectable, UnauthorizedException } from '@nestjs/common';
// Stratégie Passport pour la sécurisation des routes
import { PassportStrategy } from '@nestjs/passport';
// Stratégie JWT de Passport + extraction des tokens JWT
import { ExtractJwt, Strategy } from 'passport-jwt';
// Configuration des variables d'environnement
import { ConfigService } from '@nestjs/config';
// Service des utilisateurs
import { UsersService } from '../../users/users.service';

/**
 * Stratégie JWT utilisée par Passport pour sécuriser les routes
 * associées au guard AuthGuard('jwt')
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    // Configure les variables d'environnement (.env)
    configService: ConfigService,
    // Service permettant de récupérer les utilisateurs dans la BDD
    private usersService: UsersService,
  ) {
    super({
      // Indique où extraire le token JWT (Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // False : le token sera automatiquement rejeté
      ignoreExpiration: false,
      // Clé secrète pour vérifier la signature du token
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  /**
   * Méthode appelée automatiquement après validation du token
   * Le payload correspond au contenu décodé du JWT
   */
  async validate(payload: any) {
    // Récupère l'utilisateur dans la BDD
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    // Retourne les données de l'utilisateur
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
