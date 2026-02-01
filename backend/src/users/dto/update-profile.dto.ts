import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TrimAndSanitize } from '../../common';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @TrimAndSanitize()
  @IsString()
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  firstName?: string;

  @IsOptional()
  @TrimAndSanitize()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  lastName?: string;

  @IsOptional()
  @TrimAndSanitize()
  @IsString()
  @MaxLength(500, { message: 'La bio ne peut pas dépasser 500 caractères' })
  bio?: string;

  @IsOptional()
  @TrimAndSanitize()
  @IsString()
  @MaxLength(100, { message: 'La ville ne peut pas dépasser 100 caractères' })
  city?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: "L'URL de l'avatar est invalide" })
  avatar?: string;
}
