import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  // Échange concerné
  @Prop({ type: Types.ObjectId, ref: 'Exchange', required: true })
  exchange: Types.ObjectId;

  // Utilisateur qui laisse l'avis
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewer: Types.ObjectId;

  // Utilisateur noté
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewedUser: Types.ObjectId;

  // Note sur 5
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  // Commentaire
  @Prop({ default: '' })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Index pour les recherches
ReviewSchema.index({ exchange: 1 });
ReviewSchema.index({ reviewer: 1 });
ReviewSchema.index({ reviewedUser: 1 });

// Un utilisateur ne peut laisser qu'un seul avis par échange
ReviewSchema.index({ exchange: 1, reviewer: 1 }, { unique: true });
