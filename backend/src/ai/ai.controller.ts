import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDescriptionDto } from './dto/generate-description.dto';
import { SuggestionsResponseDto } from './dto/exchange-suggestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

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
}
