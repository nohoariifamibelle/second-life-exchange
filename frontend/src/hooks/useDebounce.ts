import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour débouncer une valeur.
 * Attend que l'utilisateur arrête de taper avant de retourner la nouvelle valeur.
 * Utile pour éviter les requêtes API excessives lors de la saisie.
 *
 * @param value - La valeur à débouncer
 * @param delay - Le délai en millisecondes (défaut: 400ms)
 * @returns La valeur débouncée
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: annuler le timeout précédent si la valeur change
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour savoir si le debounce est en cours (l'utilisateur tape encore).
 * Utile pour afficher un indicateur de chargement.
 *
 * @param value - La valeur actuelle
 * @param debouncedValue - La valeur débouncée
 * @returns true si le debounce est en cours
 */
export function useIsDebouncing<T>(value: T, debouncedValue: T): boolean {
  return value !== debouncedValue;
}
