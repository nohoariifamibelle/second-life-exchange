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

  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Vous devez accepter les CGU et la Politique de Confidentialité',
    }),
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

/**
 * Schéma pour l'utilisateur retourné par le login (avec id au lieu de _id)
 */
export const loginUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
});

/**
 * Type LoginUser
 */
export type LoginUser = z.infer<typeof loginUserSchema>;

/**
 * Schéma de validation pour la réponse login
 */
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: loginUserSchema,
});

/**
 * Type LoginResponse validé
 */
export type LoginResponse = z.infer<typeof loginResponseSchema>;

/**
 * Schéma pour le profil utilisateur complet (avec bio, city, avatar)
 */
export const profileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  bio: z.string(),
  city: z.string(),
  avatar: z.string(),
});

/**
 * Type Profile validé
 */
export type Profile = z.infer<typeof profileSchema>;

/**
 * Schéma de validation pour la mise à jour du profil
 */
export const updateProfileSchema = z.object({
  email: z
    .string()
    .email({ message: 'Format d\'email invalide' })
    .optional(),

  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le prénom ne peut contenir que des lettres')
    .optional(),

  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, 'Le nom ne peut contenir que des lettres')
    .optional(),

  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional(),

  city: z.string().max(100, 'La ville ne peut pas dépasser 100 caractères').optional(),

  avatar: z.string().optional(),
});

/**
 * Type UpdateProfileFormData
 */
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Schéma de validation pour le changement de mot de passe
 */
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est requis'),

  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le nouveau mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le nouveau mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le nouveau mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le nouveau mot de passe doit contenir au moins un caractère spécial'),

  confirmPassword: z
    .string()
    .min(1, 'La confirmation du mot de passe est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Type UpdatePasswordFormData
 */
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
