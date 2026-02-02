import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import xss, { IFilterXSSOptions } from 'xss';

/**
 * Configuration XSS permissive pour les champs texte.
 * Autorise les caractères spéciaux légitimes (accents, apostrophes, guillemets)
 * mais supprime les balises HTML et scripts malveillants.
 */
const xssOptions: IFilterXSSOptions = {
  whiteList: {}, // Aucune balise HTML autorisée
  stripIgnoreTag: true, // Supprime les balises non autorisées
  stripIgnoreTagBody: ['script', 'style'], // Supprime le contenu de script/style
  escapeHtml: (html: string) => {
    // Ne pas échapper les caractères légitimes
    // Seulement les caractères dangereux HTML
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};

/**
 * Sanitize une chaîne contre les attaques XSS.
 * Préserve les caractères spéciaux légitimes français :
 * - Accents : é, è, ê, ë, à, â, ù, û, ô, î, ï, ç, etc.
 * - Apostrophes : ' et '
 * - Tirets, underscores, points
 */
export function sanitizeXss(value: string): string {
  if (typeof value !== 'string') {
    return value;
  }

  // xss() supprime les balises dangereuses mais préserve le texte
  const sanitized = xss(value, xssOptions);

  // Restaurer les entités HTML courantes pour les caractères légitimes
  return sanitized
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

/**
 * Pipe global de sanitization XSS.
 * Appliqué automatiquement sur les DTOs pour sanitizer
 * tous les champs string avant validation.
 */
@Injectable()
export class XssSanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    // Ne sanitizer que les body (DTOs)
    if (metadata.type !== 'body') {
      return value;
    }

    if (value === null || value === undefined) {
      return value;
    }

    return this.sanitizeValue(value);
  }

  private sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return sanitizeXss(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitizeValue(val);
      }
      return sanitized;
    }

    return value;
  }
}

/**
 * Valide qu'une chaîne ne contient pas de patterns XSS dangereux.
 * Utile pour une validation stricte en plus de la sanitization.
 */
export function containsXssPatterns(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /expression\s*\(/gi, // CSS expression
    /url\s*\(\s*["']?\s*data:/gi, // data: URLs
  ];

  return xssPatterns.some((pattern) => pattern.test(value));
}
