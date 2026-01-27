import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ItemDocument = Item & Document;

// Catégories disponibles
export enum ItemCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  FURNITURE = 'furniture',
  BOOKS = 'books',
  SPORTS = 'sports',
  TOYS = 'toys',
  OTHER = 'other',
}

// États de l'objet
export enum ItemCondition {
  NEW = 'new',
  VERY_GOOD = 'very_good',
  GOOD = 'good',
  FAIR = 'fair',
}

// Statut de l'objet
export enum ItemStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  EXCHANGED = 'exchanged',
}

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, enum: ItemCategory })
  category: ItemCategory;

  @Prop({ required: true, enum: ItemCondition })
  condition: ItemCondition;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  postalCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ default: ItemStatus.AVAILABLE, enum: ItemStatus })
  status: ItemStatus;

  @Prop({ default: 0 })
  viewCount: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);

// Index pour les recherches
ItemSchema.index({ title: 'text', description: 'text' });
ItemSchema.index({ category: 1 });
ItemSchema.index({ city: 1 });
ItemSchema.index({ postalCode: 1 });
ItemSchema.index({ status: 1 });
ItemSchema.index({ owner: 1 });
ItemSchema.index({ createdAt: -1 });
