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
  Header,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ItemsService } from '../items/items.service';
import { ExchangesService } from '../exchanges/exchanges.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly exchangesService: ExchangesService,
  ) {}

  /**
   * GET /users/me/export - Export RGPD des données personnelles (Article 20)
   * Rate limité à 1 export par heure pour éviter les abus
   */
  @Get('me/export')
  @Throttle({ short: { limit: 1, ttl: 3600000 }, medium: { limit: 1, ttl: 3600000 }, long: { limit: 1, ttl: 3600000 } }) // 1 req / 1 heure
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="my-data-export.json"')
  async exportMyData(@Request() req): Promise<Record<string, unknown>> {
    const userId = req.user.userId;

    // Récupérer toutes les données de l'utilisateur en parallèle
    const [userData, items, exchanges, reviews] = await Promise.all([
      this.usersService.findById(userId),
      this.itemsService.findAllByOwner(userId),
      this.exchangesService.findByUser(userId),
      this.exchangesService.getAllReviewsByUser(userId),
    ]);

    if (!userData) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Nettoyer les données sensibles de l'utilisateur
    const userObj = userData.toObject();
    const {
      password: _password,
      __v: _v,
      ...safeUserData
    } = userObj;

    // Helper pour minimiser les données utilisateur (ne garder que firstName/lastName)
    const minimizeUser = (user: any) => {
      if (!user) return null;
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    };

    // Transformer les exchanges pour minimiser les données des autres utilisateurs
    const sanitizedExchanges = exchanges.map((exchange: any) => {
      const exchangeObj =
        typeof exchange.toObject === 'function'
          ? exchange.toObject()
          : exchange;
      const isProposer = exchangeObj.proposer?._id?.toString() === userId;
      const isReceiver = exchangeObj.receiver?._id?.toString() === userId;

      return {
        ...exchangeObj,
        // Garder toutes les données si c'est l'utilisateur, sinon minimiser
        proposer: isProposer ? exchangeObj.proposer : minimizeUser(exchangeObj.proposer),
        receiver: isReceiver ? exchangeObj.receiver : minimizeUser(exchangeObj.receiver),
      };
    });

    // Transformer les reviews pour minimiser les données
    const sanitizedReviews = {
      given: reviews.given.map((review: any) => {
        const reviewObj =
          typeof review.toObject === 'function' ? review.toObject() : review;
        return {
          ...reviewObj,
          reviewedUser: minimizeUser(reviewObj.reviewedUser),
        };
      }),
      received: reviews.received.map((review: any) => {
        const reviewObj =
          typeof review.toObject === 'function' ? review.toObject() : review;
        return {
          ...reviewObj,
          reviewer: minimizeUser(reviewObj.reviewer),
        };
      }),
    };

    return {
      exportedAt: new Date().toISOString(),
      gdprArticle: 'Article 20 - Droit à la portabilité des données',
      user: {
        ...safeUserData,
        _id: safeUserData._id?.toString(),
      },
      items: items.map((item: any) => {
        const itemObj =
          typeof item.toObject === 'function' ? item.toObject() : item;
        const { __v: _itemV, ...safeItem } = itemObj;
        return safeItem;
      }),
      exchanges: sanitizedExchanges,
      reviews: sanitizedReviews,
    };
  }

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
