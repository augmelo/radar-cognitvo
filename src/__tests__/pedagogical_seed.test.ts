import { describe, it, expect } from 'vitest';
import { ORIGINAL_SCENARIOS } from '../data/scenarios';

describe('Banco Pedagógico de Cenários (Seed)', () => {
  it('contém exatamente 16 cenários preservados com IDs únicos', () => {
    expect(ORIGINAL_SCENARIOS.length).toBe(16);
    const ids = ORIGINAL_SCENARIOS.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(16);
  });

  it('possui 8 cenários de esforço cognitivo e 8 de dependência cognitiva', () => {
    const esforco = ORIGINAL_SCENARIOS.filter(c => c.expectedCategory === 'esforco');
    const dependencia = ORIGINAL_SCENARIOS.filter(c => c.expectedCategory === 'dependencia');
    expect(esforco.length).toBe(8);
    expect(dependencia.length).toBe(8);
  });

  it('garante exatamente UMA alternativa esperada por conjunto de justificativas', () => {
    ORIGINAL_SCENARIOS.forEach(card => {
      expect(card.justifications.length).toBe(3);
      const expectedCount = card.justifications.filter(j => j.isExpected).length;
      expect(expectedCount).toBe(1);
    });
  });

  it('garante exatamente UMA alternativa esperada nos desafios de reparação dos cards de dependência', () => {
    const dependenciaCards = ORIGINAL_SCENARIOS.filter(c => c.expectedCategory === 'dependencia');
    dependenciaCards.forEach(card => {
      expect(card.repairs).toBeDefined();
      expect(card.repairs!.length).toBe(3);
      const expectedRepairs = card.repairs!.filter(r => r.isExpected).length;
      expect(expectedRepairs).toBe(1);
    });
  });

  it('verifica os cuidados pedagógicos obrigatórios nos feedbacks (cards 2, 4, 11, 12, 13, 14, 16)', () => {
    const card2 = ORIGINAL_SCENARIOS.find(c => c.id === 'card-2');
    expect(card2?.contextNote).toMatch(/calculadora/i);

    const card4 = ORIGINAL_SCENARIOS.find(c => c.id === 'card-4');
    expect(card4?.contextNote).toMatch(/autoria anterior/i);

    const card11 = ORIGINAL_SCENARIOS.find(c => c.id === 'card-11');
    expect(card11?.contextNote).toMatch(/brainstorming/i);

    const card12 = ORIGINAL_SCENARIOS.find(c => c.id === 'card-12');
    expect(card12?.contextNote).toMatch(/leitura/i);

    const card13 = ORIGINAL_SCENARIOS.find(c => c.id === 'card-13');
    expect(card13?.contextNote).toMatch(/elaboração escrita/i);

    const card14 = ORIGINAL_SCENARIOS.find(c => c.id === 'card-14');
    expect(card14?.contextNote).toMatch(/checagem/i);

    const card16 = ORIGINAL_SCENARIOS.find(c => c.id === 'card-16');
    expect(card16?.contextNote).toMatch(/acessibilidade|intimidade/i);
  });
});
