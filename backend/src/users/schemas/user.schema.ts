import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ type: Date, default: null })
  acceptedTermsAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
