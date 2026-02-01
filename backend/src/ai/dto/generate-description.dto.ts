import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GenerateDescriptionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsIn([
    'electronics',
    'clothing',
    'furniture',
    'books',
    'sports',
    'toys',
    'other',
  ])
  category: string;
}
