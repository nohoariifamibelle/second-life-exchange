import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Exchange,
  ExchangeDocument,
  ExchangeStatus,
} from '../exchanges/schemas/exchange.schema';
import { Item, ItemDocument, ItemCategory } from '../items/schemas/item.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  CO2_SAVINGS_BY_CATEGORY,
  CO2_PER_TREE_PER_YEAR,
  getEcoBadge,
} from './constants/co2.constants';
import {
  UserEcoImpactDto,
  CommunityStatsDto,
  CategoryBreakdownDto,
} from './dto/eco-impact.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Exchange.name) private exchangeModel: Model<ExchangeDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Calcule l'impact écologique d'un utilisateur
   * Prend en compte les échanges où l'utilisateur est proposer OU receiver
   */
  async getUserEcoImpact(userId: string): Promise<UserEcoImpactDto> {
    const userObjectId = new Types.ObjectId(userId);

    // Aggrégation pour récupérer les échanges complétés avec les catégories
    const exchangesWithCategories = await this.exchangeModel
      .aggregate([
        {
          // Échanges complétés où l'utilisateur est participant
          $match: {
            status: ExchangeStatus.COMPLETED,
            $or: [{ proposer: userObjectId }, { receiver: userObjectId }],
          },
        },
        {
          // Joindre l'item demandé pour avoir sa catégorie
          $lookup: {
            from: 'items',
            localField: 'requestedItem',
            foreignField: '_id',
            as: 'requestedItemData',
          },
        },
        {
          $unwind: '$requestedItemData',
        },
        {
          // Joindre les items offerts pour avoir leurs catégories
          $lookup: {
            from: 'items',
            localField: 'offeredItems',
            foreignField: '_id',
            as: 'offeredItemsData',
          },
        },
        {
          // Projeter les catégories de tous les items impliqués
          $project: {
            requestedCategory: '$requestedItemData.category',
            offeredCategories: '$offeredItemsData.category',
          },
        },
      ])
      .exec();

    // Compter les items par catégorie
    const categoryCount: Record<string, number> = {};

    for (const exchange of exchangesWithCategories) {
      // Compter l'item demandé
      const requestedCat = exchange.requestedCategory as string;
      categoryCount[requestedCat] = (categoryCount[requestedCat] || 0) + 1;

      // Compter les items offerts
      for (const offeredCat of exchange.offeredCategories) {
        categoryCount[offeredCat] = (categoryCount[offeredCat] || 0) + 1;
      }
    }

    // Calculer le CO2 économisé par catégorie
    let totalCo2 = 0;
    const breakdown: CategoryBreakdownDto[] = [];

    for (const [category, count] of Object.entries(categoryCount)) {
      const co2PerItem =
        CO2_SAVINGS_BY_CATEGORY[category as ItemCategory] ||
        CO2_SAVINGS_BY_CATEGORY[ItemCategory.OTHER];
      const co2Saved = count * co2PerItem;
      totalCo2 += co2Saved;

      breakdown.push({
        category,
        count,
        co2Saved,
      });
    }

    // Trier par CO2 économisé décroissant
    breakdown.sort((a, b) => b.co2Saved - a.co2Saved);

    const equivalentTrees =
      Math.round((totalCo2 / CO2_PER_TREE_PER_YEAR) * 100) / 100;

    return {
      totalExchanges: exchangesWithCategories.length,
      co2Saved: totalCo2,
      equivalentTrees,
      badge: getEcoBadge(totalCo2),
      breakdown,
    };
  }

  /**
   * Statistiques globales de la communauté
   */
  async getCommunityStats(): Promise<CommunityStatsDto> {
    // Compter les utilisateurs actifs
    const totalUsers = await this.userModel
      .countDocuments({ isActive: true })
      .exec();

    // Aggrégation pour les échanges complétés avec catégories
    const exchangesWithCategories = await this.exchangeModel
      .aggregate([
        {
          $match: {
            status: ExchangeStatus.COMPLETED,
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
        {
          $unwind: '$requestedItemData',
        },
        {
          $lookup: {
            from: 'items',
            localField: 'offeredItems',
            foreignField: '_id',
            as: 'offeredItemsData',
          },
        },
        {
          $project: {
            requestedCategory: '$requestedItemData.category',
            offeredCategories: '$offeredItemsData.category',
          },
        },
      ])
      .exec();

    // Compter les items par catégorie
    const categoryCount: Record<string, number> = {};

    for (const exchange of exchangesWithCategories) {
      const requestedCat = exchange.requestedCategory as string;
      categoryCount[requestedCat] = (categoryCount[requestedCat] || 0) + 1;

      for (const offeredCat of exchange.offeredCategories) {
        categoryCount[offeredCat] = (categoryCount[offeredCat] || 0) + 1;
      }
    }

    // Calculer le CO2
    let totalCo2 = 0;
    const breakdown: CategoryBreakdownDto[] = [];

    for (const [category, count] of Object.entries(categoryCount)) {
      const co2PerItem =
        CO2_SAVINGS_BY_CATEGORY[category as ItemCategory] ||
        CO2_SAVINGS_BY_CATEGORY[ItemCategory.OTHER];
      const co2Saved = count * co2PerItem;
      totalCo2 += co2Saved;

      breakdown.push({
        category,
        count,
        co2Saved,
      });
    }

    breakdown.sort((a, b) => b.co2Saved - a.co2Saved);

    const equivalentTrees =
      Math.round((totalCo2 / CO2_PER_TREE_PER_YEAR) * 100) / 100;

    return {
      totalUsers,
      totalExchanges: exchangesWithCategories.length,
      totalCo2Saved: totalCo2,
      equivalentTrees,
      breakdown,
    };
  }
}
