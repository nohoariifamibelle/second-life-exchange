import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Pipe de validation pour les ObjectId MongoDB.
 * Valide que le paramètre est un ObjectId valide avant de continuer.
 *
 * @example
 * // Dans un contrôleur
 * @Get(':id')
 * findOne(@Param('id', ParseMongoIdPipe) id: string) {
 *   return this.service.findOne(id);
 * }
 */
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(
        `${metadata.data || 'Parameter'} must be a valid MongoDB ObjectId`,
      );
    }
    return value;
  }
}
