import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Item, ItemDocument, ItemStatus } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

export interface ItemsQuery {
  category?: string;
  condition?: string;
  city?: string;
  postalCode?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

  /**
   * Crée un nouvel objet
   */
  async create(
    createItemDto: CreateItemDto,
    ownerId: string,
  ): Promise<ItemDocument> {
    const item = await this.itemModel.create({
      ...createItemDto,
      owner: new Types.ObjectId(ownerId),
    });
    // Peupler l'owner pour la réponse
    return this.itemModel
      .findById(item._id)
      .populate('owner', 'firstName lastName city avatar')
      .exec() as Promise<ItemDocument>;
  }

  /**
   * Récupère tous les objets avec filtres et pagination
   */
  async findAll(query: ItemsQuery) {
    const {
      category,
      condition,
      city,
      postalCode,
      status = ItemStatus.AVAILABLE,
      search,
      page = 1,
      limit = 12,
    } = query;

    const filter: any = { status };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (postalCode) filter.postalCode = postalCode;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.itemModel
        .find(filter)
        .populate('owner', 'firstName lastName city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.itemModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un objet par son ID
   */
  async findOne(id: string): Promise<ItemDocument> {
    const item = await this.itemModel
      .findById(id)
      .populate('owner', 'firstName lastName city avatar')
      .exec();

    if (!item) {
      throw new NotFoundException('Objet non trouvé');
    }

    return item;
  }

  /**
   * Récupère un objet et incrémente le compteur de vues
   */
  async findOneAndIncrementViews(id: string): Promise<ItemDocument> {
    const item = await this.itemModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .populate('owner', 'firstName lastName city avatar')
      .exec();

    if (!item) {
      throw new NotFoundException('Objet non trouvé');
    }

    return item;
  }

  /**
   * Récupère les objets d'un utilisateur
   */
  async findByOwner(ownerId: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.itemModel
        .find({ owner: new Types.ObjectId(ownerId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.itemModel
        .countDocuments({ owner: new Types.ObjectId(ownerId) })
        .exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Met à jour un objet
   */
  async update(
    id: string,
    updateItemDto: UpdateItemDto,
    userId: string,
  ): Promise<ItemDocument> {
    const item = await this.itemModel.findById(id).exec();

    if (!item) {
      throw new NotFoundException('Objet non trouvé');
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (item.owner.toString() !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier cet objet",
      );
    }

    const updatedItem = await this.itemModel
      .findByIdAndUpdate(id, updateItemDto, { new: true })
      .populate('owner', 'firstName lastName city avatar')
      .exec();

    if (!updatedItem) {
      throw new NotFoundException('Objet non trouvé');
    }

    return updatedItem;
  }

  /**
   * Supprime un objet
   */
  async remove(id: string, userId: string): Promise<void> {
    const item = await this.itemModel.findById(id).exec();

    if (!item) {
      throw new NotFoundException('Objet non trouvé');
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (item.owner.toString() !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer cet objet",
      );
    }

    await this.itemModel.findByIdAndDelete(id).exec();
  }

  /**
   * Compte les objets d'un utilisateur
   */
  async countByOwner(ownerId: string): Promise<number> {
    return this.itemModel
      .countDocuments({ owner: new Types.ObjectId(ownerId) })
      .exec();
  }

  /**
   * Récupère les objets disponibles en excluant un propriétaire
   */
  async findAvailableExcludingOwner(
    excludeOwnerId: string,
    limit = 50,
  ): Promise<ItemDocument[]> {
    return this.itemModel
      .find({
        status: ItemStatus.AVAILABLE,
        owner: { $ne: new Types.ObjectId(excludeOwnerId) },
      })
      .populate('owner', 'firstName lastName city')
      .limit(limit)
      .exec();
  }

  /**
   * Récupère les objets disponibles d'un utilisateur
   */
  async findAvailableByOwner(ownerId: string): Promise<ItemDocument[]> {
    return this.itemModel
      .find({
        status: ItemStatus.AVAILABLE,
        owner: new Types.ObjectId(ownerId),
      })
      .exec();
  }
}
