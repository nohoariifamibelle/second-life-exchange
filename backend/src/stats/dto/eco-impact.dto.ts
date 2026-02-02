/**
 * Badge éco de l'utilisateur
 */
export class EcoBadgeDto {
  /** Nom du badge (ex: "Eco-acteur") */
  name: string;

  /** Emoji du badge (ex: "🌿") */
  emoji: string;

  /** Niveau du badge: beginner, actor, champion, hero */
  level: string;
}

/**
 * Détail du CO2 économisé par catégorie
 */
export class CategoryBreakdownDto {
  /** Catégorie de l'item (ex: "electronics") */
  category: string;

  /** Nombre d'objets échangés dans cette catégorie */
  count: number;

  /** CO2 économisé pour cette catégorie (en kg) */
  co2Saved: number;
}

/**
 * Impact écologique de l'utilisateur
 */
export class UserEcoImpactDto {
  /** Nombre total d'échanges complétés */
  totalExchanges: number;

  /** Total CO2 économisé (en kg) */
  co2Saved: number;

  /** Équivalent en arbres plantés (basé sur 20kg CO2/arbre/an) */
  equivalentTrees: number;

  /** Badge éco actuel */
  badge: EcoBadgeDto;

  /** Détail par catégorie */
  breakdown: CategoryBreakdownDto[];
}

/**
 * Statistiques globales de la communauté
 */
export class CommunityStatsDto {
  /** Nombre total d'utilisateurs actifs */
  totalUsers: number;

  /** Nombre total d'échanges complétés */
  totalExchanges: number;

  /** Total CO2 économisé par la communauté (en kg) */
  totalCo2Saved: number;

  /** Équivalent en arbres plantés */
  equivalentTrees: number;

  /** Détail par catégorie */
  breakdown: CategoryBreakdownDto[];
}
