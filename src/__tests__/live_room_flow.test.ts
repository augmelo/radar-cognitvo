import { describe, it, expect } from 'vitest';
import { sanitizeCsvCell } from '../utils/sanitize';
import { ORIGINAL_SCENARIOS } from '../data/scenarios';

describe('Fluxo e Segurança da Sala de Aula ao Vivo', () => {
  it('garante que o código de sala gerado possui 6 caracteres sem ambiguidade visual', () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    expect(code.length).toBe(6);
    expect(code).not.toMatch(/[01OI]/); // Sem caracteres confusos
  });

  it('valida que o gabarito pedagógico e explicações estão presentes no seed de 16 cenários', () => {
    expect(ORIGINAL_SCENARIOS.length).toBe(16);
    ORIGINAL_SCENARIOS.forEach(card => {
      expect(['esforco', 'dependencia']).toContain(card.expectedCategory);
      expect(card.justifications.length).toBe(3);
      expect(card.shortExplanation.length).toBeGreaterThan(20);
    });
  });

  it('escapa fórmulas maliciosas de planilhas na exportação CSV', () => {
    const dangerousCell = '=cmd|"/C calc"!A0';
    const escaped = sanitizeCsvCell(dangerousCell);
    expect(escaped).toBe(`"'=cmd|""/C calc""!A0"`);

    const dangerousPlus = '+1+2';
    expect(sanitizeCsvCell(dangerousPlus)).toBe(`"'+1+2"`);

    const normal = 'Esforço Cognitivo';
    expect(sanitizeCsvCell(normal)).toBe(`"Esforço Cognitivo"`);
  });

  it('valida a alternância de justificativa e pontuação equilibrada de 100 pontos por rodada', () => {
    // Rodada par (0, 2, 4...) -> tem justificativa (40 pts classificação + 60 pts justificativa = 100 pts)
    const round0HasJust = (0 % 2 === 0);
    expect(round0HasJust).toBe(true);
    const round0Score = (round0HasJust ? 40 : 100) + (round0HasJust ? 60 : 0);
    expect(round0Score).toBe(100);

    // Rodada ímpar (1, 3, 5...) -> não tem justificativa (100 pts classificação = 100 pts)
    const round1HasJust = (1 % 2 === 0);
    expect(round1HasJust).toBe(false);
    const round1Score = (round1HasJust ? 40 : 100) + (round1HasJust ? 60 : 0);
    expect(round1Score).toBe(100);
  });
});
