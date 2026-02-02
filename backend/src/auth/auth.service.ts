import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import {
  SecurityLoggerService,
  SecurityLogContext,
} from '../common/services/security-logger.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private securityLogger: SecurityLoggerService,
  ) {}

  async login(loginDto: LoginDto, context: SecurityLogContext) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      // Log l'échec de connexion - utilisateur non trouvé
      await this.securityLogger.logLoginFailure(
        loginDto.email,
        context,
        'user_not_found',
      );
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      // Log l'échec de connexion - mot de passe invalide
      await this.securityLogger.logLoginFailure(
        loginDto.email,
        context,
        'invalid_password',
      );

      // Vérifier si trop de tentatives échouées (détection force brute)
      const failedAttempts = await this.securityLogger.getRecentFailedAttempts(
        context.ip,
        15, // fenêtre de 15 minutes
      );

      if (failedAttempts >= 5) {
        await this.securityLogger.logSuspiciousActivity(
          'rate_limit_exceeded',
          context,
          { attempts: failedAttempts, email: loginDto.email },
        );
      }

      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const userId = (user as any)._id.toString();

    const payload = {
      sub: userId,
      email: user.email,
      role: user.role || 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    // Log la connexion réussie
    await this.securityLogger.logLoginSuccess(userId, user.email, context);

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || 'user',
      },
    };
  }

  async refreshToken(user: any, context: SecurityLogContext) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    // Log le refresh de token
    await this.securityLogger.logTokenRefresh(user.userId, context);

    return {
      accessToken,
    };
  }

  async logout(userId: string, context: SecurityLogContext) {
    // Log la déconnexion
    await this.securityLogger.logLogout(userId, context);

    return { message: 'Déconnexion réussie' };
  }
}
