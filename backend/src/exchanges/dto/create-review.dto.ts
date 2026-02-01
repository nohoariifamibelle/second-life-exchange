import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsMongoId,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty({ message: "L'ID de l'échange est requis" })
  @IsMongoId({ message: 'ID échange invalide' })
  exchangeId: string;

  @IsNumber()
  @Min(1, { message: 'La note doit être entre 1 et 5' })
  @Max(5, { message: 'La note doit être entre 1 et 5' })
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Le commentaire ne peut pas dépasser 500 caractères',
  })
  comment?: string;
}
