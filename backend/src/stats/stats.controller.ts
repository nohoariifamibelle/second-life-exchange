import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /stats/eco-impact - Impact écologique de l'utilisateur connecté
   * Retourne le CO2 économisé, équivalent arbres, badge et détail par catégorie
   */
  @Get('eco-impact')
  @UseGuards(JwtAuthGuard)
  async getUserEcoImpact(@Request() req) {
    return this.statsService.getUserEcoImpact(req.user.userId);
  }

  /**
   * GET /stats/community - Statistiques globales de la communauté
   * Endpoint public pour afficher l'impact collectif
   */
  @Get('community')
  async getCommunityStats() {
    return this.statsService.getCommunityStats();
  }
}
