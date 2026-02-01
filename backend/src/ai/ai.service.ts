import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Types } from 'mongoose';
import { ItemsService } from '../items/items.service';
import { ExchangesService } from '../exchanges/exchanges.service';
import {
  ExchangeSuggestionDto,
  SuggestionsResponseDto,
} from './dto/exchange-suggestion.dto';
import {
  CategoryTrendDto,
  CommunityTrendsResponseDto,
  TrendStatus,
} from './dto/community-trends.dto';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private itemsService: ItemsService,
    private exchangesService: ExchangesService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('Clé API OpenAI non configurée');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async generateDescription(title: string, category: string): Promise<string> {
    const categoryLabels: Record<string, string> = {
      electronics: 'Électronique',
      clothing: 'Vêtements',
      furniture: 'Meubles',
      books: 'Livres',
      sports: 'Sports',
      toys: 'Jouets',
      other: 'Autre',
    };

    const categoryLabel = categoryLabels[category] || category;

    const systemPrompt = `Tu es un assistant qui génère des descriptions d'objets pour une plateforme d'échange entre particuliers.
Génère une description attrayante et honnête en français (3-4 phrases).
Mentionne les points forts typiques de ce type d'objet.
Ne mentionne pas de prix. Reste factuel et engageant.`;

    const userPrompt = `Génère une description pour cet objet :
- Titre : ${title}
- Catégorie : ${categoryLabel}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const description = response.choices[0]?.message?.content?.trim();

      if (!description) {
        throw new ServiceUnavailableException(
          'Service IA temporairement indisponible',
        );
      }

      return description;
    } catch (error) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      // Log minimal pour la production (évite d'exposer des infos sensibles)
      const errorCode = (error as { code?: string })?.code || 'unknown';
      console.error(`Erreur OpenAI: ${errorCode}`);
      throw new ServiceUnavailableException(
        'Service IA temporairement indisponible',
      );
    }
  }

  async getSuggestions(userId: string): Promise<SuggestionsResponseDto> {
    const categoryLabels: Record<string, string> = {
      electronics: 'Électronique',
      clothing: 'Vêtements',
      furniture: 'Meubles',
      books: 'Livres',
      sports: 'Sports',
      toys: 'Jouets',
      other: 'Autre',
    };

    // Récupérer les objets disponibles de l'utilisateur
    const userItems = await this.itemsService.findAvailableByOwner(userId);

    if (userItems.length === 0) {
      return {
        suggestions: [],
        message: 'Publiez des objets pour recevoir des suggestions',
      };
    }

    // Récupérer les objets disponibles des autres utilisateurs
    const otherItems = await this.itemsService.findAvailableExcludingOwner(
      userId,
      50,
    );

    if (otherItems.length === 0) {
      return {
        suggestions: [],
        message: 'Aucun objet disponible pour suggestion',
      };
    }

    // Préparer le prompt pour l'IA
    const userItemsDescription = userItems
      .map(
        (i) =>
          `- ${i.title} (${categoryLabels[i.category] || i.category}): ${i.description}`,
      )
      .join('\n');

    const otherItemsDescription = otherItems
      .map(
        (i) =>
          `- ID:${(i._id as Types.ObjectId).toString()} | ${i.title} (${categoryLabels[i.category] || i.category}): ${i.description}`,
      )
      .join('\n');

    const prompt = `Tu es un assistant qui suggère des échanges d'objets pertinents.

OBJETS DE L'UTILISATEUR :
${userItemsDescription}

OBJETS DISPONIBLES POUR ÉCHANGE :
${otherItemsDescription}

Suggère les 5 meilleurs échanges possibles. Pour chaque suggestion, indique :
1. L'objet de l'utilisateur concerné
2. L'objet suggéré (par son ID)
3. Un score de pertinence (0-100)
4. Une courte raison (1 phrase)

Critères de matching :
- Valeur perçue similaire
- Catégories complémentaires ou identiques
- Intérêt potentiel réciproque

Réponds en JSON uniquement avec ce format :
{
  "suggestions": [
    {
      "userItemTitle": "...",
      "suggestedItemId": "...",
      "score": 85,
      "reason": "..."
    }
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new ServiceUnavailableException(
          'Service IA temporairement indisponible',
        );
      }

      const aiResponse = JSON.parse(content);
      const rawSuggestions = aiResponse.suggestions || [];

      // Enrichir avec les données complètes des items
      const suggestions: ExchangeSuggestionDto[] = rawSuggestions
        .map(
          (s: {
            userItemTitle: string;
            suggestedItemId: string;
            score: number;
            reason: string;
          }) => {
            const userItem = userItems.find((i) => i.title === s.userItemTitle);
            const suggestedItem = otherItems.find(
              (i) => (i._id as Types.ObjectId).toString() === s.suggestedItemId,
            );

            if (!userItem || !suggestedItem) {
              return null;
            }

            const owner = suggestedItem.owner as unknown as {
              _id: Types.ObjectId;
              firstName: string;
              lastName: string;
              city: string;
            };

            return {
              userItem: {
                id: (userItem._id as Types.ObjectId).toString(),
                title: userItem.title,
                category: userItem.category,
                images: userItem.images,
              },
              suggestedItem: {
                id: (suggestedItem._id as Types.ObjectId).toString(),
                title: suggestedItem.title,
                category: suggestedItem.category,
                images: suggestedItem.images,
                owner: {
                  id: owner._id.toString(),
                  firstName: owner.firstName,
                  city: owner.city,
                },
              },
              matchScore: s.score,
              reason: s.reason,
            };
          },
        )
        .filter(
          (s: ExchangeSuggestionDto | null): s is ExchangeSuggestionDto =>
            s !== null,
        );

      return { suggestions };
    } catch (error) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      const errorCode = (error as { code?: string })?.code || 'unknown';
      console.error(`Erreur OpenAI suggestions: ${errorCode}`);
      throw new ServiceUnavailableException(
        'Service IA temporairement indisponible',
      );
    }
  }

  async getCommunityTrends(city?: string): Promise<CommunityTrendsResponseDto> {
    const categoryLabels: Record<string, string> = {
      electronics: 'Électronique',
      clothing: 'Vêtements',
      furniture: 'Meubles',
      books: 'Livres',
      sports: 'Sports',
      toys: 'Jouets',
      other: 'Autre',
    };

    // Récupérer les statistiques en parallèle
    const [categoryStats, completedExchanges, pendingRequests] =
      await Promise.all([
        this.itemsService.getCategoryStats(city),
        this.exchangesService.getCompletedExchangesByCategory(7),
        this.exchangesService.getPendingRequestsByCategory(),
      ]);

    // Construire les données par catégorie
    const categories = Object.keys(categoryLabels);
    const categoryData = categories.map((category) => {
      const stats = categoryStats.find((s) => s.category === category) || {
        availableCount: 0,
        totalViews: 0,
      };
      const exchanges = completedExchanges.find(
        (e) => e.category === category,
      ) || { completedCount: 0 };
      const requests = pendingRequests.find((r) => r.category === category) || {
        pendingCount: 0,
      };

      // Calcul du ratio demande/offre
      const demandSupplyRatio =
        stats.availableCount > 0
          ? requests.pendingCount / stats.availableCount
          : requests.pendingCount > 0
            ? 2
            : 0;

      // Déterminer le statut
      let status: TrendStatus;
      if (
        demandSupplyRatio > 1 ||
        (requests.pendingCount > 3 && stats.availableCount < 5)
      ) {
        status = TrendStatus.HOT;
      } else if (exchanges.completedCount > 2 || stats.totalViews > 50) {
        status = TrendStatus.RISING;
      } else {
        status = TrendStatus.STABLE;
      }

      // Calcul du score de tendance (0-100)
      const trendScore = Math.min(
        100,
        Math.round(
          exchanges.completedCount * 15 +
            requests.pendingCount * 10 +
            stats.totalViews / 10 +
            (demandSupplyRatio > 1 ? 20 : 0),
        ),
      );

      return {
        category,
        categoryLabel: categoryLabels[category],
        availableItems: stats.availableCount,
        totalViews: stats.totalViews,
        recentExchanges: exchanges.completedCount,
        recentRequests: requests.pendingCount,
        trendScore,
        status,
      };
    });

    // Trier par score décroissant et filtrer les catégories avec activité
    const sortedData = categoryData.sort((a, b) => b.trendScore - a.trendScore);
    const activeCategories = sortedData.filter((c) => c.trendScore > 0);

    if (activeCategories.length === 0) {
      return {
        trends: [],
        generatedAt: new Date(),
        weekNumber: this.getISOWeekNumber(new Date()),
        message: 'Pas assez de données pour générer des tendances',
      };
    }

    // Préparer le prompt pour l'IA
    const dataForAI = activeCategories.slice(0, 5).map((c) => ({
      category: c.categoryLabel,
      status: c.status,
      recentExchanges: c.recentExchanges,
      pendingRequests: c.recentRequests,
      availableItems: c.availableItems,
      views: c.totalViews,
    }));

    const prompt = `Tu es un assistant pour une plateforme d'échange d'objets entre particuliers.
Analyse ces tendances communautaires et génère des descriptions et recommandations engageantes en français.

DONNÉES DES TENDANCES :
${JSON.stringify(dataForAI, null, 2)}

Pour chaque catégorie, génère :
1. Une description courte (1-2 phrases) expliquant la tendance
2. Une recommandation/call-to-action pour les utilisateurs

Règles :
- Si status="hot" : forte demande, peu d'offres - encourager à proposer des objets
- Si status="rising" : activité croissante - mentionner le dynamisme
- Si status="stable" : activité constante - rassurer sur l'intérêt

Réponds en JSON uniquement :
{
  "categories": [
    {
      "category": "Électronique",
      "description": "Les smartphones et tablettes sont très recherchés cette semaine...",
      "recommendation": "Proposez vos anciens appareils électroniques !"
    }
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 800,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new ServiceUnavailableException(
          'Service IA temporairement indisponible',
        );
      }

      const aiResponse = JSON.parse(content);
      const aiCategories = aiResponse.categories || [];

      // Fusionner les descriptions IA avec les données
      const trends: CategoryTrendDto[] = activeCategories
        .slice(0, 5)
        .map((c) => {
          const aiData = aiCategories.find(
            (ai: { category: string }) => ai.category === c.categoryLabel,
          ) || {
            description: `La catégorie ${c.categoryLabel} est active cette semaine.`,
            recommendation: `Découvrez les objets ${c.categoryLabel.toLowerCase()} disponibles !`,
          };

          return {
            category: c.category,
            categoryLabel: c.categoryLabel,
            trendScore: c.trendScore,
            status: c.status,
            recentExchanges: c.recentExchanges,
            recentRequests: c.recentRequests,
            availableItems: c.availableItems,
            totalViews: c.totalViews,
            aiDescription: aiData.description,
            aiRecommendation: aiData.recommendation,
          };
        });

      return {
        trends,
        generatedAt: new Date(),
        weekNumber: this.getISOWeekNumber(new Date()),
      };
    } catch (error) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      const errorCode = (error as { code?: string })?.code || 'unknown';
      console.error(`Erreur OpenAI trends: ${errorCode}`);
      throw new ServiceUnavailableException(
        'Service IA temporairement indisponible',
      );
    }
  }

  private getISOWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
