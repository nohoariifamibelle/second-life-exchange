import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExchangeDocument = Exchange & Document;

// Statuts de l'échange
export enum ExchangeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REFUSED = 'refused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class Exchange {
  // Utilisateur qui propose l'échange
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  proposer: Types.ObjectId;

  // Utilisateur qui reçoit la proposition
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  // Objets proposés par le proposer (peut être plusieurs)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Item' }], required: true })
  offeredItems: Types.ObjectId[];

  // Objet demandé (celui du receiver)
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  requestedItem: Types.ObjectId;

  // Message optionnel accompagnant la proposition
  @Prop({ default: '' })
  message: string;

  // Statut de l'échange
  @Prop({ default: ExchangeStatus.PENDING, enum: ExchangeStatus })
  status: ExchangeStatus;

  // Message de réponse (optionnel, pour refus ou acceptation)
  @Prop({ default: '' })
  responseMessage: string;

  // Date de réponse
  @Prop({ type: Date })
  respondedAt: Date;

  // Date de finalisation (quand les deux parties confirment)
  @Prop({ type: Date })
  completedAt: Date;
}

export const ExchangeSchema = SchemaFactory.createForClass(Exchange);

// Index pour les recherches
ExchangeSchema.index({ proposer: 1 });
ExchangeSchema.index({ receiver: 1 });
ExchangeSchema.index({ status: 1 });
ExchangeSchema.index({ requestedItem: 1 });
ExchangeSchema.index({ createdAt: -1 });
