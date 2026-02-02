import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Exchange,
  ExchangeDocument,
  ExchangeStatus,
} from './schemas/exchange.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Item, ItemDocument, ItemStatus } from '../items/schemas/item.schema';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import {
  RespondExchangeDto,
  ExchangeResponse,
} from './dto/respond-exchange.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectModel(Exchange.name) private exchangeModel: Model<ExchangeDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  /**
   * Crée une proposition d'échange
   */
  async create(
    createExchangeDto: CreateExchangeDto,
    proposerId: string,
  ): Promise<ExchangeDocument> {
    const { offeredItemIds, requestedItemId, message } = createExchangeDto;

    // Vérifier que l'objet demandé existe et est disponible
    const requestedItem = await this.itemModel.findById(requestedItemId).exec();
    if (!requestedItem) {
      throw new NotFoundException('Objet demandé non trouvé');
    }

    if (requestedItem.status !== ItemStatus.AVAILABLE) {
      throw new BadRequestException("Cet objet n'est plus disponible");
    }

    // Vérifier que le proposer n'est pas le propriétaire de l'objet demandé
    if (requestedItem.owner.toString() === proposerId) {
      throw new BadRequestException(
        'Vous ne pouvez pas proposer un échange pour votre propre objet',
      );
    }

    // Vérifier que tous les objets proposés existent et appartiennent au proposer
    const offeredItems = await this.itemModel
      .find({
        _id: { $in: offeredItemIds },
        owner: new Types.ObjectId(proposerId),
        status: ItemStatus.AVAILABLE,
      })
      .exec();

    if (offeredItems.length !== offeredItemIds.length) {
      throw new BadRequestException(
        "Certains objets proposés n'existent pas, ne vous appartiennent pas ou ne sont plus disponibles",
      );
    }

    // Vérifier qu'il n'y a pas déjà un échange en cours pour cet objet par ce proposer
    const existingExchange = await this.exchangeModel
      .findOne({
        proposer: new Types.ObjectId(proposerId),
        requestedItem: new Types.ObjectId(requestedItemId),
        status: ExchangeStatus.PENDING,
      })
      .exec();

    if (existingExchange) {
      throw new ConflictException(
        'Vous avez déjà une proposition en cours pour cet objet',
      );
    }

    // Créer l'échange
    const exchange = await this.exchangeModel.create({
      proposer: new Types.ObjectId(proposerId),
      receiver: requestedItem.owner,
      offeredItems: offeredItemIds.map((id) => new Types.ObjectId(id)),
      requestedItem: new Types.ObjectId(requestedItemId),
      message: message || '',
    });

    // Retourner l'échange peuplé
    return this.findById((exchange._id as Types.ObjectId).toString());
  }

  /**
   * Récupère un échange par son ID
   */
  async findById(id: string): Promise<ExchangeDocument> {
    const exchange = await this.exchangeModel
      .findById(id)
      .populate('proposer', 'firstName lastName avatar city')
      .populate('receiver', 'firstName lastName avatar city')
      .populate('offeredItems', 'title images category condition city')
      .populate('requestedItem', 'title images category condition city')
      .exec();

    if (!exchange) {
      throw new NotFoundException('Échange non trouvé');
    }

    return exchange;
  }

  /**
   * Liste les échanges d'un utilisateur (reçus et envoyés)
   */
  async findByUser(userId: string, type?: 'sent' | 'received') {
    const filter: any = {};

    if (type === 'sent') {
      filter.proposer = new Types.ObjectId(userId);
    } else if (type === 'received') {
      filter.receiver = new Types.ObjectId(userId);
    } else {
      filter.$or = [
        { proposer: new Types.ObjectId(userId) },
        { receiver: new Types.ObjectId(userId) },
      ];
    }

    const exchanges = await this.exchangeModel
      .find(filter)
      .populate('proposer', 'firstName lastName avatar')
      .populate('receiver', 'firstName lastName avatar')
      .populate('offeredItems', 'title images')
      .populate('requestedItem', 'title images')
      .sort({ createdAt: -1 })
      .exec();

    return exchanges;
  }

  /**
   * Compte les échanges en attente pour un utilisateur
   */
  async countPending(userId: string): Promise<number> {
    return this.exchangeModel
      .countDocuments({
        receiver: new Types.ObjectId(userId),
        status: ExchangeStatus.PENDING,
      })
      .exec();
  }

  /**
   * Répond à une proposition d'échange
   */
  async respond(
    exchangeId: string,
    respondExchangeDto: RespondExchangeDto,
    userId: string,
  ): Promise<ExchangeDocument> {
    const exchange = await this.exchangeModel.findById(exchangeId).exec();

    if (!exchange) {
      throw new NotFoundException('Échange non trouvé');
    }

    // Vérifier que l'utilisateur est le receiver
    if (exchange.receiver.toString() !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à répondre à cette proposition",
      );
    }

    // Vérifier que l'échange est en attente
    if (exchange.status !== ExchangeStatus.PENDING) {
      throw new BadRequestException('Cette proposition a déjà été traitée');
    }

    const { response, message } = respondExchangeDto;

    if (response === ExchangeResponse.ACCEPT) {
      // Mettre à jour le statut de l'échange
      exchange.status = ExchangeStatus.ACCEPTED;
      exchange.responseMessage = message || '';
      exchange.respondedAt = new Date();

      // Marquer les objets comme réservés
      await this.itemModel.updateMany(
        { _id: { $in: exchange.offeredItems } },
        { status: ItemStatus.RESERVED },
      );

      await this.itemModel.findByIdAndUpdate(exchange.requestedItem, {
        status: ItemStatus.RESERVED,
      });
    } else {
      exchange.status = ExchangeStatus.REFUSED;
      exchange.responseMessage = message || '';
      exchange.respondedAt = new Date();
    }

    await exchange.save();

    return this.findById(exchangeId);
  }

  /**
   * Annule une proposition d'échange (par le proposer)
   */
  async cancel(exchangeId: string, userId: string): Promise<ExchangeDocument> {
    const exchange = await this.exchangeModel.findById(exchangeId).exec();

    if (!exchange) {
      throw new NotFoundException('Échange non trouvé');
    }

    // Vérifier que l'utilisateur est le proposer
    if (exchange.proposer.toString() !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à annuler cette proposition",
      );
    }

    // Vérifier que l'échange est en attente
    if (exchange.status !== ExchangeStatus.PENDING) {
      throw new BadRequestException(
        'Cette proposition ne peut plus être annulée',
      );
    }

    exchange.status = ExchangeStatus.CANCELLED;
    await exchange.save();

    return this.findById(exchangeId);
  }

  /**
   * Finalise un échange (après acceptation)
   */
  async complete(
    exchangeId: string,
    userId: string,
  ): Promise<ExchangeDocument> {
    const exchange = await this.exchangeModel.findById(exchangeId).exec();

    if (!exchange) {
      throw new NotFoundException('Échange non trouvé');
    }

    // Vérifier que l'utilisateur fait partie de l'échange
    if (
      exchange.proposer.toString() !== userId &&
      exchange.receiver.toString() !== userId
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à finaliser cet échange",
      );
    }

    // Vérifier que l'échange est accepté
    if (exchange.status !== ExchangeStatus.ACCEPTED) {
      throw new BadRequestException(
        'Seul un échange accepté peut être finalisé',
      );
    }

    exchange.status = ExchangeStatus.COMPLETED;
    exchange.completedAt = new Date();

    // Marquer les objets comme échangés
    await this.itemModel.updateMany(
      { _id: { $in: exchange.offeredItems } },
      { status: ItemStatus.EXCHANGED },
    );

    await this.itemModel.findByIdAndUpdate(exchange.requestedItem, {
      status: ItemStatus.EXCHANGED,
    });

    await exchange.save();

    return this.findById(exchangeId);
  }

  /**
   * Crée un avis après un échange
   */
  async createReview(
    createReviewDto: CreateReviewDto,
    reviewerId: string,
  ): Promise<ReviewDocument> {
    const { exchangeId, rating, comment } = createReviewDto;

    const exchange = await this.exchangeModel.findById(exchangeId).exec();

    if (!exchange) {
      throw new NotFoundException('Échange non trouvé');
    }

    // Vérifier que l'échange est complété
    if (exchange.status !== ExchangeStatus.COMPLETED) {
      throw new BadRequestException(
        'Vous ne pouvez noter que les échanges finalisés',
      );
    }

    // Vérifier que l'utilisateur fait partie de l'échange
    const isProposer = exchange.proposer.toString() === reviewerId;
    const isReceiver = exchange.receiver.toString() === reviewerId;

    if (!isProposer && !isReceiver) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à noter cet échange",
      );
    }

    // Déterminer qui est noté
    const reviewedUserId = isProposer ? exchange.receiver : exchange.proposer;

    // Vérifier qu'un avis n'a pas déjà été laissé
    const existingReview = await this.reviewModel
      .findOne({
        exchange: new Types.ObjectId(exchangeId),
        reviewer: new Types.ObjectId(reviewerId),
      })
      .exec();

    if (existingReview) {
      throw new ConflictException('Vous avez déjà noté cet échange');
    }

    const review = await this.reviewModel.create({
      exchange: new Types.ObjectId(exchangeId),
      reviewer: new Types.ObjectId(reviewerId),
      reviewedUser: reviewedUserId,
      rating,
      comment: comment || '',
    });

    return review;
  }

  /**
   * Récupère les avis d'un utilisateur
   */
  async getReviewsForUser(userId: string) {
    const reviews = await this.reviewModel
      .find({ reviewedUser: new Types.ObjectId(userId) })
      .populate('reviewer', 'firstName lastName avatar')
      .populate('exchange')
      .sort({ createdAt: -1 })
      .exec();

    // Calculer la note moyenne
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    };
  }

  /**
   * Récupère TOUTES les reviews d'un utilisateur (données et reçues) pour export RGPD
   * Minimise les données des autres utilisateurs (pas d'email)
   */
  async getAllReviewsByUser(userId: string) {
    const [givenReviews, receivedReviews] = await Promise.all([
      // Reviews données par l'utilisateur
      this.reviewModel
        .find({ reviewer: new Types.ObjectId(userId) })
        .populate('reviewedUser', 'firstName lastName')
        .populate('exchange', 'status completedAt')
        .sort({ createdAt: -1 })
        .exec(),
      // Reviews reçues par l'utilisateur
      this.reviewModel
        .find({ reviewedUser: new Types.ObjectId(userId) })
        .populate('reviewer', 'firstName lastName')
        .populate('exchange', 'status completedAt')
        .sort({ createdAt: -1 })
        .exec(),
    ]);

    return {
      given: givenReviews,
      received: receivedReviews,
    };
  }

  /**
   * Échanges complétés par catégorie (pour analyse des tendances)
   */
  async getCompletedExchangesByCategory(
    days: number = 7,
  ): Promise<{ category: string; completedCount: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.exchangeModel
      .aggregate([
        {
          $match: {
            status: ExchangeStatus.COMPLETED,
            completedAt: { $gte: since },
          },
        },
        {
          $lookup: {
            from: 'items',
            localField: 'requestedItem',
            foreignField: '_id',
            as: 'requestedItemData',
          },
        },
        { $unwind: '$requestedItemData' },
        {
          $group: {
            _id: '$requestedItemData.category',
            completedCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            completedCount: 1,
          },
        },
      ])
      .exec();
  }

  /**
   * Demandes en attente par catégorie (indique la demande)
   */
  async getPendingRequestsByCategory(): Promise<
    { category: string; pendingCount: number }[]
  > {
    return this.exchangeModel
      .aggregate([
        {
          $match: {
            status: ExchangeStatus.PENDING,
          },
        },
        {
          $lookup: {
            from: 'items',
            localField: 'requestedItem',
            foreignField: '_id',
            as: 'requestedItemData',
          },
        },
        { $unwind: '$requestedItemData' },
        {
          $group: {
            _id: '$requestedItemData.category',
            pendingCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            pendingCount: 1,
          },
        },
      ])
      .exec();
  }
}
