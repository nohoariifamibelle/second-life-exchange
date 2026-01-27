import {
  itemSchema,
  itemsResponseSchema,
  type Item,
  type ItemsResponse,
  type CreateItemFormData,
  type UpdateItemFormData,
} from '@/schemas/item';
import { apiErrorSchema } from '@/schemas/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ItemsQueryParams {
  category?: string;
  condition?: string;
  city?: string;
  postalCode?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Récupère la liste des objets avec filtres
 */
export async function getItems(params?: ItemsQueryParams): Promise<ItemsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.append('category', params.category);
  if (params?.condition) searchParams.append('condition', params.condition);
  if (params?.city) searchParams.append('city', params.city);
  if (params?.postalCode) searchParams.append('postalCode', params.postalCode);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_URL}/items${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des objets');
  }

  const jsonData = await response.json();
  const result = itemsResponseSchema.safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Récupère les objets de l'utilisateur connecté
 */
export async function getMyItems(
  accessToken: string,
  page = 1,
  limit = 12
): Promise<ItemsResponse> {
  const response = await fetch(
    `${API_URL}/items/my?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de vos objets');
  }

  const jsonData = await response.json();
  const result = itemsResponseSchema.safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Compte les objets de l'utilisateur connecté
 */
export async function getMyItemsCount(accessToken: string): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/items/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API items/count:', response.status, errorData);
      throw new Error('Erreur lors du comptage des objets');
    }

    const data = await response.json();
    return data.count ?? 0;
  } catch (error) {
    console.error('Erreur getMyItemsCount:', error);
    throw error;
  }
}

/**
 * Récupère un objet par son ID
 */
export async function getItem(id: string): Promise<Item> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Objet non trouvé');
    }
    throw new Error("Erreur lors de la récupération de l'objet");
  }

  const jsonData = await response.json();
  const result = itemSchema.safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Crée un nouvel objet
 */
export async function createItem(
  accessToken: string,
  data: CreateItemFormData
): Promise<Item> {
  const response = await fetch(`${API_URL}/items`, {
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

    throw new Error("Erreur lors de la création de l'objet");
  }

  const result = itemSchema.safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Met à jour un objet
 */
export async function updateItem(
  accessToken: string,
  id: string,
  data: UpdateItemFormData
): Promise<Item> {
  const response = await fetch(`${API_URL}/items/${id}`, {
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

    throw new Error("Erreur lors de la mise à jour de l'objet");
  }

  const result = itemSchema.safeParse(jsonData);

  if (!result.success) {
    console.error('Erreur de validation:', result.error);
    throw new Error('Format de réponse API invalide');
  }

  return result.data;
}

/**
 * Supprime un objet
 */
export async function deleteItem(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const jsonData = await response.json();
    const errorResult = apiErrorSchema.safeParse(jsonData);

    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(', ')
        : errorResult.data.message;
      throw new Error(errorMessage);
    }

    throw new Error("Erreur lors de la suppression de l'objet");
  }
}
