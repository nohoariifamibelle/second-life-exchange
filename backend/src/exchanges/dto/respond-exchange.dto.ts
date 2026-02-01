import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TrimAndSanitize } from '../../common';

export enum ExchangeResponse {
  ACCEPT = 'accept',
  REFUSE = 'refuse',
}

export class RespondExchangeDto {
  @IsEnum(ExchangeResponse, { message: 'Réponse invalide (accept ou refuse)' })
  response: ExchangeResponse;

  @IsOptional()
  @TrimAndSanitize()
  @IsString()
  @MaxLength(500, { message: 'Le message ne peut pas dépasser 500 caractères' })
  message?: string;
}
