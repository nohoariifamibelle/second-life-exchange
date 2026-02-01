import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hacher le mot de passe avec bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Extraire acceptedTerms du DTO (ne pas le stocker dans le document)
    // Note: La validation @Equals(true) dans le DTO garantit déjà que acceptedTerms est true
    const { acceptedTerms: _acceptedTerms, ...userData } = createUserDto;

    // Créer le nouvel utilisateur avec le password haché et la date d'acceptation
    const createdUser = await this.userModel.create({
      ...userData,
      password: hashedPassword,
      acceptedTermsAt: new Date(),
    });

    return createdUser;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    // Vérifier si l'utilisateur existe
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateProfileDto.email })
        .exec();

      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateProfileDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return updatedUser;
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    // Récupérer l'utilisateur avec son mot de passe
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect');
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    // Mettre à jour le mot de passe
    await this.userModel
      .findByIdAndUpdate(userId, { password: hashedPassword })
      .exec();
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId).exec();

    if (!result) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
  }
}
