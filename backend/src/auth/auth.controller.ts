import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SecurityLogContext } from '../common/services/security-logger.service';

/**
 * Extrait le contexte de sécurité (IP, User-Agent) de la requête
 */
function extractSecurityContext(req: ExpressRequest): SecurityLogContext {
  // Gestion des proxies (X-Forwarded-For) et IP directe
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip =
    (Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]) ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown';

  const userAgent = req.headers['user-agent'] || 'unknown';

  return { ip: ip.trim(), userAgent };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   * Rate limit strict : 3 tentatives par heure par IP (OWASP A04)
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 req / 1 heure
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    // Ne pas retourner le mot de passe dans la réponse
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
    const { password, ...result } = user.toObject();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  /**
   * Connexion d'un utilisateur
   * Rate limit strict : 5 tentatives par 15 minutes par IP (OWASP A04)
   * Logging sécurité : succès, échecs, activités suspectes (OWASP A09)
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 req / 15 minutes
  async login(@Body() loginDto: LoginDto, @Req() req: ExpressRequest) {
    const context = extractSecurityContext(req);
    return this.authService.login(loginDto, context);
  }

  /**
   * Rafraîchissement du token d'accès
   * Logging sécurité : token refresh tracé (OWASP A09)
   */
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req, @Req() rawReq: ExpressRequest) {
    const context = extractSecurityContext(rawReq);
    return this.authService.refreshToken(req.user, context);
  }

  /**
   * Déconnexion de l'utilisateur
   * Logging sécurité : logout tracé (OWASP A09)
   * Note: Côté client, supprimer les tokens stockés
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Req() rawReq: ExpressRequest) {
    const context = extractSecurityContext(rawReq);
    return this.authService.logout(req.user.userId, context);
  }
}
