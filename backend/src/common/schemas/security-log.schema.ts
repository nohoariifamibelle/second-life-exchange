import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SecurityLogDocument = SecurityLog & Document;

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
}

@Schema({ timestamps: true })
export class SecurityLog {
  @Prop({ required: true, enum: SecurityEventType })
  eventType: SecurityEventType;

  @Prop({ index: true })
  userId: string;

  @Prop({ index: true })
  email: string;

  @Prop({ required: true, index: true })
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  reason: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ default: Date.now, index: true })
  timestamp: Date;
}

export const SecurityLogSchema = SchemaFactory.createForClass(SecurityLog);

// Index pour la recherche par date (utile pour la rotation et l'audit)
SecurityLogSchema.index({ timestamp: -1 });

// Index composé pour rechercher les événements d'un utilisateur
SecurityLogSchema.index({ userId: 1, timestamp: -1 });

// Index composé pour détecter les tentatives suspectes par IP
SecurityLogSchema.index({ ipAddress: 1, eventType: 1, timestamp: -1 });

// TTL index pour auto-supprimer les logs après 90 jours (configurable)
// Commenté par défaut - décommenter si rotation automatique souhaitée
// SecurityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
