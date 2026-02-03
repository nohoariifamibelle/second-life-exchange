import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { GenerateDescriptionDto } from './dto/generate-description.dto';
import { SuggestionsResponseDto } from './dto/exchange-suggestion.dto';
import {
  CommunityTrendsResponseDto,
  GetTrendsQueryDto,
} from './dto/community-trends.dto';
import { EcoTipsResponseDto } from './dto/eco-tips.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * GET /ai/eco-tips - Conseils écologiques générés par IA
   * Endpoint PUBLIC pour la page découverte
   * Rate limit : 10 req/min par IP
   * Cache serveur : 24h pour économiser les appels OpenAI
   */
  @Public()
  @Get('eco-tips')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req / 1 minute
  async getEcoTips(): Promise<EcoTipsResponseDto> {
    return this.aiService.generateEcoTips();
  }

  @Post('generate-description')
  async generateDescription(
    @Body() generateDescriptionDto: GenerateDescriptionDto,
  ): Promise<{ description: string }> {
    const description = await this.aiService.generateDescription(
      generateDescriptionDto.title,
      generateDescriptionDto.category,
    );

    return { description };
  }

  @Get('suggestions')
  async getSuggestions(@Request() req): Promise<SuggestionsResponseDto> {
    return this.aiService.getSuggestions(req.user.userId);
  }

  @Get('trends')
  async getCommunityTrends(
    @Query() query: GetTrendsQueryDto,
  ): Promise<CommunityTrendsResponseDto> {
    return this.aiService.getCommunityTrends(query.city);
  }
}
