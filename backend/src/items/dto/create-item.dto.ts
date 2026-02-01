import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
  MaxLength,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import { ItemCategory, ItemCondition } from '../schemas/item.schema';
import { TrimAndSanitize } from '../../common';

export class CreateItemDto {
  @TrimAndSanitize()
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title: string;

  @TrimAndSanitize()
  @IsString()
  @IsNotEmpty({ message: 'La description est requise' })
  @MinLength(10, {
    message: 'La description doit contenir au moins 10 caractères',
  })
  @MaxLength(2000, {
    message: 'La description ne peut pas dépasser 2000 caractères',
  })
  description: string;

  @IsEnum(ItemCategory, { message: 'Catégorie invalide' })
  category: ItemCategory;

  @IsEnum(ItemCondition, { message: 'État invalide' })
  condition: ItemCondition;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'Maximum 3 images autorisées' })
  @IsString({ each: true })
  images?: string[];

  @TrimAndSanitize()
  @IsString()
  @IsNotEmpty({ message: 'La ville est requise' })
  @MaxLength(100, { message: 'La ville ne peut pas dépasser 100 caractères' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Le code postal est requis' })
  @Matches(/^[0-9]{5}$/, { message: 'Le code postal doit contenir 5 chiffres' })
  postalCode: string;
}
