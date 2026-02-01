import { z } from 'zod';

// Statuts de l'échange
export const ExchangeStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REFUSED: 'refused',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type ExchangeStatusType = typeof ExchangeStatus[keyof typeof ExchangeStatus];

// Labels des statuts en français
export const statusLabels: Record<ExchangeStatusType, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  refused: 'Refusé',
  cancelled: 'Annulé',
  completed: 'Finalisé',
};

// Couleurs pour les badges de statut
export const statusColors: Record<ExchangeStatusType, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
};

/**
 * Schéma utilisateur simplifié dans les réponses
 */
export const exchangeUserSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  city: z.string().optional(),
});

export type ExchangeUser = z.infer<typeof exchangeUserSchema>;

/**
 * Schéma objet simplifié dans les réponses
 */
export const exchangeItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  city: z.string().optional(),
});

export type ExchangeItem = z.infer<typeof exchangeItemSchema>;

/**
 * Schéma d'un échange
 * Note: requestedItem et offeredItems peuvent être null si les objets ont été supprimés
 */
export const exchangeSchema = z.object({
  id: z.string(),
  proposer: exchangeUserSchema,
  receiver: exchangeUserSchema,
  offeredItems: z.array(exchangeItemSchema.nullable()).transform((items) =>
    items.filter((item): item is z.infer<typeof exchangeItemSchema> => item !== null)
  ),
  requestedItem: exchangeItemSchema.nullable(),
  message: z.string(),
  status: z.string(),
  responseMessage: z.string(),
  respondedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Exchange = z.infer<typeof exchangeSchema>;

/**
 * Schéma pour créer un échange
 */
export const createExchangeSchema = z.object({
  offeredItemIds: z
    .array(z.string())
    .min(1, 'Vous devez proposer au moins un objet'),

  requestedItemId: z
    .string()
    .min(1, "L'objet demandé est requis"),

  message: z
    .string()
    .max(500, 'Le message ne peut pas dépasser 500 caractères')
    .optional(),
});

export type CreateExchangeFormData = z.infer<typeof createExchangeSchema>;

/**
 * Schéma pour répondre à un échange
 */
export const respondExchangeSchema = z.object({
  response: z.enum(['accept', 'refuse']),

  message: z
    .string()
    .max(500, 'Le message ne peut pas dépasser 500 caractères')
    .optional(),
});

export type RespondExchangeFormData = z.infer<typeof respondExchangeSchema>;

/**
 * Schéma d'un avis
 */
export const reviewSchema = z.object({
  id: z.string(),
  exchangeId: z.string(),
  reviewer: exchangeUserSchema,
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string(),
});

export type Review = z.infer<typeof reviewSchema>;

/**
 * Schéma pour créer un avis
 */
export const createReviewSchema = z.object({
  exchangeId: z.string().min(1, "L'ID de l'échange est requis"),

  rating: z
    .number()
    .min(1, 'La note doit être entre 1 et 5')
    .max(5, 'La note doit être entre 1 et 5'),

  comment: z
    .string()
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères')
    .optional(),
});

export type CreateReviewFormData = z.infer<typeof createReviewSchema>;

/**
 * Schéma réponse avis utilisateur
 */
export const userReviewsResponseSchema = z.object({
  reviews: z.array(reviewSchema),
  averageRating: z.number(),
  totalReviews: z.number(),
});

export type UserReviewsResponse = z.infer<typeof userReviewsResponseSchema>;
