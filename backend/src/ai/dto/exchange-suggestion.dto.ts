export class ExchangeSuggestionDto {
  userItem: {
    id: string;
    title: string;
    category: string;
    images: string[];
  };
  suggestedItem: {
    id: string;
    title: string;
    category: string;
    images: string[];
    owner: {
      id: string;
      firstName: string;
      city: string;
    };
  };
  matchScore: number; // 0-100
  reason: string; // Explication de l'IA
}

export class SuggestionsResponseDto {
  suggestions: ExchangeSuggestionDto[];
  message?: string;
}
