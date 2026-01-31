const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ExchangeSuggestion {
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
  matchScore: number;
  reason: string;
}

export interface SuggestionsResponse {
  suggestions: ExchangeSuggestion[];
  message?: string;
}

export async function generateDescription(
  accessToken: string,
  title: string,
  category: string
): Promise<string> {
  const response = await fetch(`${API_URL}/ai/generate-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title, category }),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    const errorMessage = Array.isArray(jsonData.message)
      ? jsonData.message.join(', ')
      : jsonData.message || 'Erreur lors de la génération';
    throw new Error(errorMessage);
  }

  return jsonData.description;
}

export async function getSuggestions(
  accessToken: string
): Promise<SuggestionsResponse> {
  const response = await fetch(`${API_URL}/ai/suggestions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const jsonData = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    const errorMessage = Array.isArray(jsonData.message)
      ? jsonData.message.join(', ')
      : jsonData.message || 'Erreur lors de la récupération des suggestions';
    throw new Error(errorMessage);
  }

  return jsonData;
}
