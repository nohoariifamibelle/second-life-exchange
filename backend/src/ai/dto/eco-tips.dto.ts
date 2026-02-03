export interface EcoTip {
  icon: string;
  title: string;
  description: string;
}

export interface EcoTipsResponseDto {
  tips: EcoTip[];
  generatedAt: string;
}
