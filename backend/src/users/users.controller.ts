import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me - Récupère le profil de l'utilisateur connecté
   */
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);

    if (!user) {
      return null;
    }

    // Retourner l'utilisateur sans le mot de passe
    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = userObj;

    return {
      id: userObj._id.toString(),
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      bio: result.bio || '',
      city: result.city || '',
      avatar: result.avatar || '',
    };
  }

  /**
   * PATCH /users/me - Met à jour le profil de l'utilisateur connecté
   */
  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.userId,
      updateProfileDto,
    );

    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = userObj;

    return {
      id: userObj._id.toString(),
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
      role: result.role,
      bio: result.bio || '',
      city: result.city || '',
      avatar: result.avatar || '',
    };
  }

  /**
   * PATCH /users/me/password - Change le mot de passe de l'utilisateur connecté
   */
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(req.user.userId, updatePasswordDto);
    return { message: 'Mot de passe modifié avec succès' };
  }

  /**
   * DELETE /users/me - Supprime le compte de l'utilisateur connecté
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req) {
    await this.usersService.deleteUser(req.user.userId);
    return { message: 'Compte supprimé avec succès' };
  }
}
