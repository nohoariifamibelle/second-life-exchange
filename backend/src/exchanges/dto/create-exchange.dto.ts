import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ArrayMinSize,
  IsMongoId,
  MaxLength,
} from 'class-validator';

export class CreateExchangeDto {
  // IDs des objets proposés
  @IsArray()
  @ArrayMinSize(1, { message: 'Vous devez proposer au moins un objet' })
  @IsMongoId({ each: true, message: 'ID objet invalide' })
  offeredItemIds: string[];

  // ID de l'objet demandé
  @IsString()
  @IsNotEmpty({ message: "L'objet demandé est requis" })
  @IsMongoId({ message: 'ID objet demandé invalide' })
  requestedItemId: string;

  // Message optionnel
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Le message ne peut pas dépasser 500 caractères' })
  message?: string;
}
