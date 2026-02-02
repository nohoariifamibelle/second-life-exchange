/**
 * Utilitaire pour optimiser les URLs d'images Cloudinary
 *
 * Transforme les URLs Cloudinary brutes en URLs optimisées avec :
 * - f_auto : sert WebP/AVIF selon le navigateur
 * - q_auto : qualité optimisée automatiquement
 * - Dimensions optionnelles pour le responsive
 */

export interface CloudinaryImageOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:low" | "auto:eco" | "auto:good" | "auto:best" | number;
  crop?: "fill" | "scale" | "fit" | "limit" | "thumb" | "crop";
}

// Dimensions par défaut selon le contexte d'affichage
export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 300 },
  card: { width: 400, height: 400 },
  detail: { width: 800, height: 600 },
  avatar: { width: 150, height: 150 },
  full: { width: 1200, height: 1200 },
} as const;

/**
 * Transforme une URL Cloudinary brute en URL optimisée
 *
 * @param url - URL Cloudinary originale
 * @param options - Options de transformation (dimensions, qualité, crop)
 * @returns URL optimisée avec les transformations Cloudinary
 *
 * @example
 * // URL simple avec optimisation auto
 * getOptimizedImageUrl("https://res.cloudinary.com/xxx/image/upload/v1234/image.jpg")
 * // => "https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto/v1234/image.jpg"
 *
 * @example
 * // URL avec dimensions spécifiques
 * getOptimizedImageUrl(url, { width: 300, height: 300 })
 * // => "https://res.cloudinary.com/xxx/image/upload/f_auto,q_auto,w_300,h_300,c_fill/v1234/image.jpg"
 */
export function getOptimizedImageUrl(
  url: string,
  options: CloudinaryImageOptions = {}
): string {
  // Retourne l'URL originale si ce n'est pas une URL Cloudinary valide
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const { width, height, quality = "auto", crop = "fill" } = options;

  // Construit les transformations
  const transformations: string[] = ["f_auto"];

  // Qualité
  if (typeof quality === "number") {
    transformations.push(`q_${quality}`);
  } else {
    transformations.push(`q_${quality}`);
  }

  // Dimensions
  if (width) {
    transformations.push(`w_${width}`);
  }
  if (height) {
    transformations.push(`h_${height}`);
  }

  // Crop mode (seulement si des dimensions sont spécifiées)
  if (width || height) {
    transformations.push(`c_${crop}`);
  }

  const transformationString = transformations.join(",");

  // Pattern pour détecter si des transformations existent déjà
  // URL type: https://res.cloudinary.com/xxx/image/upload/[transformations]/v1234/path/image.jpg
  const uploadPattern = /\/image\/upload\//;

  if (uploadPattern.test(url)) {
    // Vérifie si des transformations existent déjà (présence de f_, q_, w_, etc. avant /v)
    const hasExistingTransformations = /\/image\/upload\/[a-z]_[^\/]+\/v\d+/.test(url);

    if (hasExistingTransformations) {
      // Remplace les transformations existantes
      return url.replace(
        /\/image\/upload\/[^\/]+\/(v\d+)/,
        `/image/upload/${transformationString}/$1`
      );
    } else {
      // Ajoute les transformations après /upload/
      return url.replace(
        /\/image\/upload\//,
        `/image/upload/${transformationString}/`
      );
    }
  }

  // Si le pattern ne correspond pas, retourne l'URL originale
  return url;
}

/**
 * Génère une URL optimisée pour une thumbnail (liste d'items)
 */
export function getThumbnailUrl(url: string): string {
  return getOptimizedImageUrl(url, IMAGE_SIZES.thumbnail);
}

/**
 * Génère une URL optimisée pour une card
 */
export function getCardImageUrl(url: string): string {
  return getOptimizedImageUrl(url, IMAGE_SIZES.card);
}

/**
 * Génère une URL optimisée pour la page détail
 */
export function getDetailImageUrl(url: string): string {
  return getOptimizedImageUrl(url, IMAGE_SIZES.detail);
}

/**
 * Génère une URL optimisée pour un avatar
 */
export function getAvatarUrl(url: string): string {
  return getOptimizedImageUrl(url, IMAGE_SIZES.avatar);
}

/**
 * Génère une URL optimisée pleine résolution
 */
export function getFullImageUrl(url: string): string {
  return getOptimizedImageUrl(url, { ...IMAGE_SIZES.full, crop: "limit" });
}
