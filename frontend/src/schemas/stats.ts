import { z } from "zod";

// Badge éco
export const ecoBadgeSchema = z.object({
  name: z.string(),
  emoji: z.string(),
  level: z.enum(["beginner", "actor", "champion", "hero"]),
});

// Détail par catégorie
export const categoryBreakdownSchema = z.object({
  category: z.string(),
  count: z.number(),
  co2Saved: z.number(),
});

// Impact écologique utilisateur
export const userEcoImpactSchema = z.object({
  totalExchanges: z.number(),
  co2Saved: z.number(),
  equivalentTrees: z.number(),
  badge: ecoBadgeSchema,
  breakdown: z.array(categoryBreakdownSchema),
});

// Statistiques communauté
export const communityStatsSchema = z.object({
  totalUsers: z.number(),
  totalExchanges: z.number(),
  totalCo2Saved: z.number(),
  equivalentTrees: z.number(),
  breakdown: z.array(categoryBreakdownSchema),
});

// Types inférés
export type EcoBadge = z.infer<typeof ecoBadgeSchema>;
export type CategoryBreakdown = z.infer<typeof categoryBreakdownSchema>;
export type UserEcoImpact = z.infer<typeof userEcoImpactSchema>;
export type CommunityStats = z.infer<typeof communityStatsSchema>;

// Labels français pour les catégories
export const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Électronique",
  clothing: "Vêtements",
  furniture: "Meubles",
  books: "Livres",
  sports: "Sports",
  toys: "Jouets",
  other: "Autres",
};

// Labels et couleurs pour les badges
export const BADGE_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  beginner: {
    label: "Eco-débutant",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  actor: {
    label: "Eco-acteur",
    color: "text-green-700",
    bgColor: "bg-green-200",
  },
  champion: {
    label: "Eco-champion",
    color: "text-green-800",
    bgColor: "bg-green-300",
  },
  hero: {
    label: "Eco-héros",
    color: "text-emerald-900",
    bgColor: "bg-emerald-400",
  },
};
