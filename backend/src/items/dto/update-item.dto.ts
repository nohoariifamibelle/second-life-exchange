import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import {
  ItemCategory,
  ItemCondition,
  ItemStatus,
} from '../schemas/item.schema';

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, {
    message: 'La description doit contenir au moins 10 caractères',
  })
  @MaxLength(2000, {
    message: 'La description ne peut pas dépasser 2000 caractères',
  })
  description?: string;

  @IsOptional()
  @IsEnum(ItemCategory, { message: 'Catégorie invalide' })
  category?: ItemCategory;

  @IsOptional()
  @IsEnum(ItemCondition, { message: 'État invalide' })
  condition?: ItemCondition;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'Maximum 3 images autorisées' })
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La ville ne peut pas dépasser 100 caractères' })
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Le code postal doit contenir 5 chiffres' })
  postalCode?: string;

  @IsOptional()
  @IsEnum(ItemStatus, { message: 'Statut invalide' })
  status?: ItemStatus;
}
