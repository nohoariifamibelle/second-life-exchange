import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
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
        throw new ServiceUnavailableException('Service IA temporairement indisponible');
      }

      return description;
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof InternalServerErrorException) {
        throw error;
      }
      // Log minimal pour la production (évite d'exposer des infos sensibles)
      const errorCode = (error as { code?: string })?.code || 'unknown';
      console.error(`Erreur OpenAI: ${errorCode}`);
      throw new ServiceUnavailableException('Service IA temporairement indisponible');
    }
  }
}
