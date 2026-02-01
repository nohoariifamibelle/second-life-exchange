import { sanitizeXss, containsXssPatterns } from './xss-sanitize.pipe';

describe('XSS Sanitization', () => {
  describe('sanitizeXss', () => {
    it('should preserve French accented characters', () => {
      const input = "Très beau vélo d'occasion à échanger";
      const result = sanitizeXss(input);
      expect(result).toBe(input);
    });

    it('should preserve apostrophes and quotes', () => {
      const input = "C'est l'article que j'ai acheté hier";
      const result = sanitizeXss(input);
      expect(result).toContain("C'est");
      expect(result).toContain("l'article");
    });

    it('should preserve special punctuation', () => {
      const input = 'Prix: 50€ - État: neuf! Question?';
      const result = sanitizeXss(input);
      expect(result).toContain('50€');
      expect(result).toContain('neuf!');
      expect(result).toContain('Question?');
    });

    it('should remove script tags', () => {
      const input = '<script>alert("XSS")</script>Texte normal';
      const result = sanitizeXss(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Texte normal');
    });

    it('should escape HTML tags', () => {
      const input = '<div onclick="evil()">Click me</div>';
      const result = sanitizeXss(input);
      expect(result).not.toContain('<div');
      expect(result).not.toContain('onclick');
    });

    it('should handle javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeXss(input);
      expect(result).not.toContain('javascript:');
    });

    it('should preserve emojis', () => {
      const input = 'Super produit! 👍🎉';
      const result = sanitizeXss(input);
      expect(result).toContain('👍');
      expect(result).toContain('🎉');
    });

    it('should handle multiline text', () => {
      const input = `Première ligne
      Deuxième ligne avec accent: été
      Troisième ligne`;
      const result = sanitizeXss(input);
      expect(result).toContain('Première ligne');
      expect(result).toContain('été');
    });
  });

  describe('containsXssPatterns', () => {
    it('should detect script tags', () => {
      expect(containsXssPatterns('<script>alert(1)</script>')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsXssPatterns('<img onerror="alert(1)">')).toBe(true);
      expect(containsXssPatterns('<div onclick="evil()">')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsXssPatterns('javascript:alert(1)')).toBe(true);
    });

    it('should not flag normal text', () => {
      expect(containsXssPatterns('Bonjour, comment ça va?')).toBe(false);
      expect(containsXssPatterns("C'est un bel article")).toBe(false);
    });
  });
});
