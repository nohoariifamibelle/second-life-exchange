import { ItemCategory } from '../../items/schemas/item.schema';

/**
 * CO2 économisé par catégorie d'objet (en kg)
 *
 * Ces estimations sont basées sur des moyennes de l'impact carbone
 * de la production de nouveaux objets versus leur réutilisation.
 *
 * Sources d'estimation :
 * - ADEME (Agence de l'Environnement et de la Maîtrise de l'Énergie)
 * - Ellen MacArthur Foundation - Circular Economy reports
 * - European Environment Agency - Textile waste data
 *
 * Vêtements (5 kg) : Production d'un vêtement moyen = 5-10 kg CO2
 * Électronique (20 kg) : Smartphone/tablette = 20-70 kg CO2, moyenne à 20 kg
 * Livres (2 kg) : Production papier + impression = 1-3 kg CO2
 * Meubles (50 kg) : Production bois/métal + transport = 30-100 kg CO2
 * Jouets (3 kg) : Production plastique + transport = 2-5 kg CO2
 * Sports (8 kg) : Équipements sportifs variés = 5-15 kg CO2
 * Autres (5 kg) : Estimation moyenne conservative
 */
export const CO2_SAVINGS_BY_CATEGORY: Record<ItemCategory, number> = {
  [ItemCategory.CLOTHING]: 5,
  [ItemCategory.ELECTRONICS]: 20,
  [ItemCategory.BOOKS]: 2,
  [ItemCategory.FURNITURE]: 50,
  [ItemCategory.TOYS]: 3,
  [ItemCategory.SPORTS]: 8,
  [ItemCategory.OTHER]: 5,
};

/**
 * Un arbre absorbe en moyenne 20 kg de CO2 par an
 * Source : ADEME, ONF (Office National des Forêts)
 */
export const CO2_PER_TREE_PER_YEAR = 20;

/**
 * Seuils pour les badges éco
 */
export const ECO_BADGE_THRESHOLDS = {
  BEGINNER: { min: 0, max: 10, name: 'Eco-débutant', emoji: '🌱' },
  ACTOR: { min: 10, max: 50, name: 'Eco-acteur', emoji: '🌿' },
  CHAMPION: { min: 50, max: 100, name: 'Eco-champion', emoji: '🌳' },
  HERO: { min: 100, max: Infinity, name: 'Eco-héros', emoji: '🌍' },
} as const;

/**
 * Retourne le badge éco correspondant au CO2 économisé
 */
export function getEcoBadge(co2Saved: number): {
  name: string;
  emoji: string;
  level: string;
} {
  if (co2Saved >= ECO_BADGE_THRESHOLDS.HERO.min) {
    return {
      name: ECO_BADGE_THRESHOLDS.HERO.name,
      emoji: ECO_BADGE_THRESHOLDS.HERO.emoji,
      level: 'hero',
    };
  }
  if (co2Saved >= ECO_BADGE_THRESHOLDS.CHAMPION.min) {
    return {
      name: ECO_BADGE_THRESHOLDS.CHAMPION.name,
      emoji: ECO_BADGE_THRESHOLDS.CHAMPION.emoji,
      level: 'champion',
    };
  }
  if (co2Saved >= ECO_BADGE_THRESHOLDS.ACTOR.min) {
    return {
      name: ECO_BADGE_THRESHOLDS.ACTOR.name,
      emoji: ECO_BADGE_THRESHOLDS.ACTOR.emoji,
      level: 'actor',
    };
  }
  return {
    name: ECO_BADGE_THRESHOLDS.BEGINNER.name,
    emoji: ECO_BADGE_THRESHOLDS.BEGINNER.emoji,
    level: 'beginner',
  };
}
