import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /upload/images - Upload jusqu'à 3 images
   */
  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
          callback(
            new BadRequestException(
              'Seuls les fichiers jpg, png et webp sont autorisés',
            ),
            false,
          );
        } else {
          callback(null, true);
        }
      },
    }),
  )
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.uploadService.uploadImages(files);
  }

  /**
   * DELETE /upload/images/:publicId - Supprime une image
   * Le publicId est encodé en base64 pour éviter les problèmes avec les slashes
   */
  @Delete('images/:publicId')
  @HttpCode(HttpStatus.OK)
  async deleteImage(@Param('publicId') publicId: string) {
    // Décoder le publicId depuis base64
    const decodedPublicId = Buffer.from(publicId, 'base64').toString('utf-8');
    await this.uploadService.deleteImage(decodedPublicId);
    return { message: 'Image supprimée avec succès' };
  }
}
