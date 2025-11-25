import { z } from 'zod';

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email({ message: 'Format d\'email invalide' }),

  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),

  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le prénom ne peut contenir que des lettres'),

  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le nom ne peut contenir que des lettres'),
});

/**
 * Type TypeScript inféré du schéma de validation
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schéma de validation pour la connexion
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email({ message: 'Format d\'email invalide' }),

  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

/**
 * Type TypeScript inféré du schéma de connexion
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schéma de validation pour la réponse API User
 * MongoDB retourne _id au lieu de id
 */
export const userSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Type User validé
 */
export type User = z.infer<typeof userSchema>;

/**
 * Schéma de validation pour les erreurs API
 */
export const apiErrorSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Type ApiError validé
 */
export type ApiError = z.infer<typeof apiErrorSchema>;
