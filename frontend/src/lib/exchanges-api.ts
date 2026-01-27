import {
  exchangeSchema,
  type Exchange,
  type CreateExchangeFormData,
  type RespondExchangeFormData,
  type CreateReviewFormData,
  reviewSchema,
  type Review,
  userReviewsResponseSchema,
  type UserReviewsResponse,
} from '@/schemas/exchange';
import { apiErrorSchema } from '@/schemas/auth';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Crée une proposition d'échange
 */
export async function createExchange(
  accessToken: string,
  data: CreateExchangeFormData
): Promise<Exchange> {
  const response = await fetch(`${API_URL}/exchanges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    const errorResult = apiErrorSchema.safeParse(jsonData);
    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(', ')
        : errorResult.data.message;
      throw new Error(errorMessage);
    }
    throw new Error("Erreur lors de la création de l'échange");
  }

  const result = exchangeSchema.safeParse(jsonData);
  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Récupère les échanges de l'utilisateur
 */
export async function getExchanges(
  accessToken: string,
  type?: 'sent' | 'received'
): Promise<Exchange[]> {
  const url = type
    ? `${API_URL}/exchanges?type=${type}`
    : `${API_URL}/exchanges`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des échanges');
  }

  const jsonData = await response.json();
  const result = z.array(exchangeSchema).safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Compte les propositions en attente
 */
export async function getPendingCount(accessToken: string): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/exchanges/pending/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API exchanges/pending/count:', response.status, errorData);
      throw new Error('Erreur lors du comptage');
    }

    const data = await response.json();
    return data.count ?? 0;
  } catch (error) {
    console.error('Erreur getPendingCount:', error);
    throw error;
  }
}

/**
 * Récupère un échange par son ID
 */
export async function getExchange(
  accessToken: string,
  id: string
): Promise<Exchange> {
  const response = await fetch(`${API_URL}/exchanges/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération de l'échange");
  }

  const jsonData = await response.json();
  const result = exchangeSchema.safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Répond à une proposition d'échange
 */
export async function respondToExchange(
  accessToken: string,
  id: string,
  data: RespondExchangeFormData
): Promise<Exchange> {
  const response = await fetch(`${API_URL}/exchanges/${id}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    const errorResult = apiErrorSchema.safeParse(jsonData);
    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(', ')
        : errorResult.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Erreur lors de la réponse');
  }

  const result = exchangeSchema.safeParse(jsonData);
  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Annule une proposition d'échange
 */
export async function cancelExchange(
  accessToken: string,
  id: string
): Promise<Exchange> {
  const response = await fetch(`${API_URL}/exchanges/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const jsonData = await response.json();

  if (!response.ok) {
    const errorResult = apiErrorSchema.safeParse(jsonData);
    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(', ')
        : errorResult.data.message;
      throw new Error(errorMessage);
    }
    throw new Error("Erreur lors de l'annulation");
  }

  const result = exchangeSchema.safeParse(jsonData);
  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Finalise un échange
 */
export async function completeExchange(
  accessToken: string,
  id: string
): Promise<Exchange> {
  const response = await fetch(`${API_URL}/exchanges/${id}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const jsonData = await response.json();

  if (!response.ok) {
    const errorResult = apiErrorSchema.safeParse(jsonData);
    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(', ')
        : errorResult.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Erreur lors de la finalisation');
  }

  const result = exchangeSchema.safeParse(jsonData);
  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Crée un avis pour un échange
 */
export async function createReview(
  accessToken: string,
  data: CreateReviewFormData
): Promise<Review> {
  const response = await fetch(`${API_URL}/exchanges/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    const errorResult = apiErrorSchema.safeParse(jsonData);
    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(', ')
        : errorResult.data.message;
      throw new Error(errorMessage);
    }
    throw new Error("Erreur lors de la création de l'avis");
  }

  const result = reviewSchema.safeParse(jsonData);
  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Récupère les avis d'un utilisateur
 */
export async function getUserReviews(
  accessToken: string,
  userId: string
): Promise<UserReviewsResponse> {
  const response = await fetch(`${API_URL}/exchanges/reviews/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des avis');
  }

  const jsonData = await response.json();
  const result = userReviewsResponseSchema.safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}
