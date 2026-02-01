import { Transform } from 'class-transformer';
import { sanitizeXss } from '../pipes/xss-sanitize.pipe';

/**
 * Décorateur pour sanitizer automatiquement un champ contre XSS.
 * À appliquer sur les propriétés string des DTOs qui acceptent du texte libre.
 *
 * @example
 * class CreateItemDto {
 *   @SanitizeXss()
 *   @IsString()
 *   description: string;
 * }
 */
export function SanitizeXss(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeXss(value);
    }
    return value;
  });
}

/**
 * Décorateur pour sanitizer un tableau de strings contre XSS.
 *
 * @example
 * class MyDto {
 *   @SanitizeXssArray()
 *   @IsArray()
 *   tags: string[];
 * }
 */
export function SanitizeXssArray(): PropertyDecorator {
  return Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? sanitizeXss(item) : item,
      );
    }
    return value;
  });
}

/**
 * Décorateur pour trim et sanitizer un champ.
 * Combine trim() et sanitization XSS.
 *
 * @example
 * class MyDto {
 *   @TrimAndSanitize()
 *   @IsString()
 *   name: string;
 * }
 */
export function TrimAndSanitize(): PropertyDecorator {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeXss(value.trim());
    }
    return value;
  });
}
