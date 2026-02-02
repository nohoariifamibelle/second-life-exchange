import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SecurityLog,
  SecurityLogDocument,
  SecurityEventType,
} from '../schemas/security-log.schema';

export interface SecurityLogContext {
  ip: string;
  userAgent?: string;
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger('Security');

  constructor(
    @InjectModel(SecurityLog.name)
    private securityLogModel: Model<SecurityLogDocument>,
  ) {}

  /**
   * Log une connexion réussie
   */
  async logLoginSuccess(
    userId: string,
    email: string,
    context: SecurityLogContext,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `LOGIN_SUCCESS | user: ${userId} | email: ${this.maskEmail(email)} | ip: ${context.ip} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.LOGIN_SUCCESS,
      userId,
      email,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log une tentative de connexion échouée
   * IMPORTANT: Ne jamais logger le mot de passe
   */
  async logLoginFailure(
    email: string,
    context: SecurityLogContext,
    reason: 'user_not_found' | 'invalid_password' | 'account_locked' | 'rate_limited',
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.warn(
      `LOGIN_FAILURE | email: ${email} | ip: ${context.ip} | reason: ${reason} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.LOGIN_FAILURE,
      email,
      ipAddress: context.ip,
      userAgent: context.userAgent,
      reason,
    });
  }

  /**
   * Log une déconnexion
   */
  async logLogout(userId: string, context: SecurityLogContext): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `LOGOUT | user: ${userId} | ip: ${context.ip} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.LOGOUT,
      userId,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log une demande de réinitialisation de mot de passe
   */
  async logPasswordReset(
    email: string,
    context: SecurityLogContext,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `PASSWORD_RESET | email: ${email} | ip: ${context.ip} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.PASSWORD_RESET,
      email,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log un changement de mot de passe réussi
   */
  async logPasswordChange(
    userId: string,
    context: SecurityLogContext,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `PASSWORD_CHANGE | user: ${userId} | ip: ${context.ip} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.PASSWORD_CHANGE,
      userId,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log une activité suspecte
   */
  async logSuspiciousActivity(
    details: string,
    context: SecurityLogContext,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.warn(
      `SUSPICIOUS | ip: ${context.ip} | reason: ${details} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ipAddress: context.ip,
      userAgent: context.userAgent,
      reason: details,
      metadata,
    });
  }

  /**
   * Log un refresh de token
   */
  async logTokenRefresh(
    userId: string,
    context: SecurityLogContext,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.log(
      `TOKEN_REFRESH | user: ${userId} | ip: ${context.ip} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.TOKEN_REFRESH,
      userId,
      ipAddress: context.ip,
      userAgent: context.userAgent,
    });
  }

  /**
   * Log un verrouillage de compte (trop de tentatives)
   */
  async logAccountLocked(
    email: string,
    context: SecurityLogContext,
    attempts: number,
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    this.logger.warn(
      `ACCOUNT_LOCKED | email: ${email} | ip: ${context.ip} | attempts: ${attempts} | ${timestamp}`,
    );

    await this.persistLog({
      eventType: SecurityEventType.ACCOUNT_LOCKED,
      email,
      ipAddress: context.ip,
      userAgent: context.userAgent,
      reason: 'rate_limit_exceeded',
      metadata: { attempts },
    });
  }

  /**
   * Récupère les tentatives de login échouées récentes pour une IP
   * Utile pour détecter les attaques par force brute
   */
  async getRecentFailedAttempts(
    ip: string,
    windowMinutes: number = 15,
  ): Promise<number> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const count = await this.securityLogModel.countDocuments({
      ipAddress: ip,
      eventType: SecurityEventType.LOGIN_FAILURE,
      timestamp: { $gte: windowStart },
    });

    return count;
  }

  /**
   * Récupère les logs de sécurité pour un utilisateur (audit trail)
   */
  async getUserSecurityLogs(
    userId: string,
    limit: number = 50,
  ): Promise<SecurityLogDocument[]> {
    return this.securityLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Récupère les logs de sécurité pour une IP
   */
  async getIpSecurityLogs(
    ip: string,
    limit: number = 50,
  ): Promise<SecurityLogDocument[]> {
    return this.securityLogModel
      .find({ ipAddress: ip })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Persiste un log en base de données
   */
  private async persistLog(
    data: Partial<SecurityLog>,
  ): Promise<SecurityLogDocument> {
    const log = new this.securityLogModel({
      ...data,
      timestamp: new Date(),
    });

    return log.save();
  }

  /**
   * Masque partiellement un email pour les logs sensibles
   */
  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.slice(0, 2)}***@${domain}`;
  }
}
