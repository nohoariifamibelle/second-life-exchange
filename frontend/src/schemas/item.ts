import { z } from 'zod';

// Catégories disponibles
export const ItemCategory = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  FURNITURE: 'furniture',
  BOOKS: 'books',
  SPORTS: 'sports',
  TOYS: 'toys',
  OTHER: 'other',
} as const;

export type ItemCategoryType = typeof ItemCategory[keyof typeof ItemCategory];

// Labels des catégories en français
export const categoryLabels: Record<ItemCategoryType, string> = {
  electronics: 'Électronique',
  clothing: 'Vêtements',
  furniture: 'Meubles',
  books: 'Livres',
  sports: 'Sports',
  toys: 'Jouets',
  other: 'Autre',
};

// États de l'objet
export const ItemCondition = {
  NEW: 'new',
  VERY_GOOD: 'very_good',
  GOOD: 'good',
  FAIR: 'fair',
} as const;

export type ItemConditionType = typeof ItemCondition[keyof typeof ItemCondition];

// Labels des états en français
export const conditionLabels: Record<ItemConditionType, string> = {
  new: 'Neuf',
  very_good: 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
};

// Statuts de l'objet
export const ItemStatus = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  EXCHANGED: 'exchanged',
} as const;

export type ItemStatusType = typeof ItemStatus[keyof typeof ItemStatus];

// Labels des statuts en français
export const statusLabels: Record<ItemStatusType, string> = {
  available: 'Disponible',
  reserved: 'Réservé',
  exchanged: 'Échangé',
};

/**
 * Schéma du propriétaire dans la réponse
 */
export const itemOwnerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  city: z.string(),
  avatar: z.string(),
});

export type ItemOwner = z.infer<typeof itemOwnerSchema>;

/**
 * Schéma d'un objet
 */
export const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  condition: z.string(),
  images: z.array(z.string()),
  city: z.string(),
  postalCode: z.string(),
  status: z.string(),
  viewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  owner: itemOwnerSchema.optional(),
  ownerId: z.string().optional(),
});

export type Item = z.infer<typeof itemSchema>;

/**
 * Schéma de la pagination
 */
export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Schéma de la réponse liste d'objets
 */
export const itemsResponseSchema = z.object({
  items: z.array(itemSchema),
  pagination: paginationSchema,
});

export type ItemsResponse = z.infer<typeof itemsResponseSchema>;

/**
 * Schéma de validation pour la création d'un objet
 */
export const createItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),

  description: z
    .string()
    .min(1, 'La description est requise')
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),

  category: z.enum(
    ['electronics', 'clothing', 'furniture', 'books', 'sports', 'toys', 'other'],
    { message: 'Veuillez sélectionner une catégorie' }
  ),

  condition: z.enum(['new', 'very_good', 'good', 'fair'], {
    message: 'Veuillez sélectionner un état',
  }),

  images: z
    .array(z.string())
    .max(3, 'Maximum 3 images autorisées')
    .default([]),

  city: z
    .string()
    .min(1, 'La ville est requise')
    .max(100, 'La ville ne peut pas dépasser 100 caractères'),

  postalCode: z
    .string()
    .min(1, 'Le code postal est requis')
    .regex(/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres'),
});

export type CreateItemFormData = z.infer<typeof createItemSchema>;

/**
 * Schéma de validation pour la mise à jour d'un objet
 */
export const updateItemSchema = createItemSchema.partial().extend({
  status: z
    .enum(['available', 'reserved', 'exchanged'])
    .optional(),
});

export type UpdateItemFormData = z.infer<typeof updateItemSchema>;
