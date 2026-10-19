import { describe, it, expect } from 'vitest';
import { P2PRoomHost } from '../engine/p2pHost';

describe('P2P Room Host Engine', () => {
  it('initializes room code and selected cards count', () => {
    let capturedState: any = null;
    const host = new P2PRoomHost(
      { cardCount: 8, timerDuration: 0, goal: 80, mode: 'classification' },
      (state) => { capturedState = state; },
      () => {},
      'P2PTST'
    );

    expect(host.roomCode).toBe('P2PTST');
    expect(capturedState).not.toBeNull();
    expect(capturedState.totalRounds).toBe(8);
    expect(capturedState.phase).toBe('lobby');
    expect(capturedState.isP2P).toBe(true);
    expect(capturedState.settings.goal).toBe(80);

    host.destroy();
  });

  it('garante que exatamente metade dos cenários possuem justificativa em ordem aleatória', () => {
    // Para 4 cenários -> exatamente 2 com justificativa
    const host4 = new P2PRoomHost(
      { cardCount: 4, timerDuration: 0, goal: 80, mode: 'classification' },
      () => {},
      () => {}
    );
    const summary4 = (host4 as any).computeScenariosSummary();
    const countWithJust4 = summary4.filter((s: any) => s.hasJustification).length;
    expect(countWithJust4).toBe(2);
    host4.destroy();

    // Para 8 cenários -> exatamente 4 com justificativa
    const host8 = new P2PRoomHost(
      { cardCount: 8, timerDuration: 0, goal: 80, mode: 'classification' },
      () => {},
      () => {}
    );
    const summary8 = (host8 as any).computeScenariosSummary();
    const countWithJust8 = summary8.filter((s: any) => s.hasJustification).length;
    expect(countWithJust8).toBe(4);
    host8.destroy();
  });

  it('finaliza diretamente as rodadas e vai para finished na última resposta sem abrir revelação intermediária', () => {
    let capturedState: any = null;
    const host = new P2PRoomHost(
      { cardCount: 4, timerDuration: 0, goal: 80, mode: 'classification' },
      (state) => { capturedState = state; },
      () => {},
      'P2PFIN'
    );

    // Inicia a primeira rodada
    host.advancePhase('classifying');
    expect(capturedState.phase).toBe('classifying');

    // Simula avançar todas as rodadas até a última
    for (let i = 0; i < 3; i++) {
      host.advancePhase(); // classifying -> justifying ou revealing
      if (capturedState.phase === 'justifying') {
        host.advancePhase(); // justifying -> revealing
      }
      expect(capturedState.phase).toBe('revealing');
      host.advancePhase(); // revealing -> next classifying
    }

    // Agora estamos no 4º cenário (última rodada, index 3)
    expect(capturedState.currentRoundIndex).toBe(3);
    expect(capturedState.phase).toBe('classifying');

    const lastHasJust = capturedState.hasJustification;
    if (lastHasJust) {
      host.advancePhase(); // vai para justifying
      expect(capturedState.phase).toBe('justifying');
      host.advancePhase(); // última resposta -> vai DIRETO para finished
      expect(capturedState.phase).toBe('finished');
    } else {
      host.advancePhase(); // última resposta sem justificativa -> vai DIRETO para finished
      expect(capturedState.phase).toBe('finished');
    }

    host.destroy();
  });

  it('transitions phases accurately and advances rounds', () => {
    let capturedState: any = null;
    const host = new P2PRoomHost(
      { cardCount: 4, timerDuration: 0, goal: 80, mode: 'classification' },
      (state) => { capturedState = state; },
      () => {},
      'P2PPHS'
    );

    expect(capturedState.phase).toBe('lobby');

    // Avança para classificação
    host.advancePhase('classifying');
    expect(capturedState.phase).toBe('classifying');
    expect(capturedState.currentRoundIndex).toBe(0);

    // Pausa e despausa
    host.togglePause();
    expect(capturedState.isPaused).toBe(true);
    host.togglePause();
    expect(capturedState.isPaused).toBe(false);

    // Encerra a sala
    host.finishRoom();
    expect(capturedState.phase).toBe('finished');

    const csv = host.exportCsv();
    expect(csv).toContain('Ranking');
    expect(csv).toContain('Estudante');

    host.destroy();
  });
});
