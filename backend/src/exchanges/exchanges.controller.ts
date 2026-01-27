import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { RespondExchangeDto } from './dto/respond-exchange.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exchanges')
@UseGuards(JwtAuthGuard)
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  /**
   * POST /exchanges - Créer une proposition d'échange
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExchangeDto: CreateExchangeDto, @Request() req) {
    const exchange = await this.exchangesService.create(
      createExchangeDto,
      req.user.userId,
    );
    return this.formatExchangeResponse(exchange);
  }

  /**
   * GET /exchanges - Liste les échanges de l'utilisateur
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('type') type?: 'sent' | 'received',
  ) {
    const exchanges = await this.exchangesService.findByUser(
      req.user.userId,
      type,
    );
    return exchanges.map((e) => this.formatExchangeResponse(e));
  }

  /**
   * GET /exchanges/pending/count - Compte les propositions en attente
   */
  @Get('pending/count')
  async countPending(@Request() req) {
    const count = await this.exchangesService.countPending(req.user.userId);
    return { count };
  }

  /**
   * GET /exchanges/:id - Récupère un échange par son ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const exchange = await this.exchangesService.findById(id);

    // Vérifier que l'utilisateur fait partie de l'échange
    const isProposer =
      this.getId(exchange.proposer) === req.user.userId;
    const isReceiver =
      this.getId(exchange.receiver) === req.user.userId;

    if (!isProposer && !isReceiver) {
      return { error: "Vous n'avez pas accès à cet échange" };
    }

    return this.formatExchangeResponse(exchange);
  }

  /**
   * PATCH /exchanges/:id/respond - Répondre à une proposition
   */
  @Patch(':id/respond')
  async respond(
    @Param('id') id: string,
    @Body() respondExchangeDto: RespondExchangeDto,
    @Request() req,
  ) {
    const exchange = await this.exchangesService.respond(
      id,
      respondExchangeDto,
      req.user.userId,
    );
    return this.formatExchangeResponse(exchange);
  }

  /**
   * PATCH /exchanges/:id/cancel - Annuler une proposition
   */
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req) {
    const exchange = await this.exchangesService.cancel(id, req.user.userId);
    return this.formatExchangeResponse(exchange);
  }

  /**
   * PATCH /exchanges/:id/complete - Finaliser un échange
   */
  @Patch(':id/complete')
  async complete(@Param('id') id: string, @Request() req) {
    const exchange = await this.exchangesService.complete(id, req.user.userId);
    return this.formatExchangeResponse(exchange);
  }

  /**
   * POST /exchanges/reviews - Créer un avis
   */
  @Post('reviews')
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    const review = await this.exchangesService.createReview(
      createReviewDto,
      req.user.userId,
    );
    return this.formatReviewResponse(review);
  }

  /**
   * GET /exchanges/reviews/user/:userId - Récupère les avis d'un utilisateur
   */
  @Get('reviews/user/:userId')
  async getReviews(@Param('userId') userId: string) {
    const result = await this.exchangesService.getReviewsForUser(userId);
    return {
      reviews: result.reviews.map((r) => this.formatReviewResponse(r)),
      averageRating: result.averageRating,
      totalReviews: result.totalReviews,
    };
  }

  /**
   * Récupère l'ID d'un objet (peuplé ou non)
   */
  private getId(obj: any): string {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj._id) return obj._id.toString();
    if (obj.id) return obj.id;
    return obj.toString();
  }

  /**
   * Formate la réponse d'un échange
   */
  private formatExchangeResponse(exchange: any) {
    const exchangeObj = exchange.toObject ? exchange.toObject() : exchange;

    return {
      id: exchangeObj._id.toString(),
      proposer: this.formatUserResponse(exchangeObj.proposer),
      receiver: this.formatUserResponse(exchangeObj.receiver),
      offeredItems: (exchangeObj.offeredItems || []).map((item: any) =>
        this.formatItemResponse(item),
      ),
      requestedItem: this.formatItemResponse(exchangeObj.requestedItem),
      message: exchangeObj.message || '',
      status: exchangeObj.status,
      responseMessage: exchangeObj.responseMessage || '',
      respondedAt: exchangeObj.respondedAt || null,
      completedAt: exchangeObj.completedAt || null,
      createdAt: exchangeObj.createdAt,
      updatedAt: exchangeObj.updatedAt,
    };
  }

  /**
   * Formate un utilisateur
   */
  private formatUserResponse(user: any) {
    if (!user) return null;
    if (typeof user === 'string' || !user.firstName) {
      return { id: user.toString() };
    }
    return {
      id: (user._id || user.id || '').toString(),
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar || '',
      city: user.city || '',
    };
  }

  /**
   * Formate un objet
   */
  private formatItemResponse(item: any) {
    if (!item) return null;
    if (typeof item === 'string' || !item.title) {
      return { id: item.toString() };
    }
    return {
      id: (item._id || item.id || '').toString(),
      title: item.title || '',
      images: item.images || [],
      category: item.category || '',
      condition: item.condition || '',
      city: item.city || '',
    };
  }

  /**
   * Formate un avis
   */
  private formatReviewResponse(review: any) {
    const reviewObj = review.toObject ? review.toObject() : review;

    return {
      id: reviewObj._id.toString(),
      exchangeId: this.getId(reviewObj.exchange),
      reviewer: this.formatUserResponse(reviewObj.reviewer),
      rating: reviewObj.rating,
      comment: reviewObj.comment || '',
      createdAt: reviewObj.createdAt,
    };
  }
}
