import { IsOptional, IsString } from 'class-validator';

export enum TrendStatus {
  HOT = 'hot',
  RISING = 'rising',
  STABLE = 'stable',
}

export class CategoryTrendDto {
  category: string;
  categoryLabel: string;
  trendScore: number;
  status: TrendStatus;
  recentExchanges: number;
  recentRequests: number;
  availableItems: number;
  totalViews: number;
  aiDescription: string;
  aiRecommendation: string;
}

export class CommunityTrendsResponseDto {
  trends: CategoryTrendDto[];
  generatedAt: Date;
  weekNumber: number;
  message?: string;
}

export class GetTrendsQueryDto {
  @IsOptional()
  @IsString()
  city?: string;
}
