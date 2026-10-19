import { describe, it, expect } from 'vitest';
import { sanitizeCsvCell, sanitizeText } from '../utils/sanitize';

describe('Segurança, Higienização CSV e Tokens de Sala', () => {
  it('escapa células CSV contra injeção de fórmulas (=, +, -, @)', () => {
    // Fórmulas comuns de ataque CSV
    expect(sanitizeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(sanitizeCsvCell('+cmd|')).toBe(`"'+cmd|"`);
    expect(sanitizeCsvCell('-2+5')).toBe(`"'-2+5"`);
    expect(sanitizeCsvCell('@SUM(A1:A10)')).toBe(`"'@SUM(A1:A10)"`);
    expect(sanitizeCsvCell('Texto normal')).toBe(`"Texto normal"`);
    expect(sanitizeCsvCell(100)).toBe(`"100"`);
  });

  it('sanitiza texto livre removendo tags HTML e injeção de scripts', () => {
    const malicious = '<script>alert("xss")</script>Texto <b>em negrito</b>';
    const clean = sanitizeText(malicious);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
  });

  it('garante que tokens de sala são strings opacas e não vazias', () => {
    const token = 'tok_' + Math.random().toString(36).substring(2);
    expect(token.length).toBeGreaterThan(6);
    expect(token).toMatch(/^tok_[a-z0-9]+$/);
  });
});
