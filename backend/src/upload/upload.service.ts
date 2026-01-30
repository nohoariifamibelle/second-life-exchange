import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<{ urls: string[]; publicIds: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 images autorisées');
    }

    const uploadPromises = files.map((file) => this.uploadToCloudinary(file));
    const results = await Promise.all(uploadPromises);

    return {
      urls: results.map((r) => r.secure_url),
      publicIds: results.map((r) => r.public_id),
    };
  }

  /**
   * Upload a single file to Cloudinary
   */
  private uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'second-life-exchange/items',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(
              new BadRequestException(
                `Erreur lors de l'upload: ${error.message}`,
              ),
            );
          } else if (result) {
            resolve(result);
          } else {
            reject(new BadRequestException("Erreur inconnue lors de l'upload"));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de la suppression: ${error.message}`,
      );
    }
  }
}
