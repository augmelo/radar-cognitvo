/**
 * Radar Cognitivo - P2P Room Host (Navegador do Professor como Servidor Autoritativo)
 * 
 * Executa toda a máquina de estados pedagógica diretamente no navegador do professor via WebRTC DataChannels.
 * Suporta dezenas de alunos conectados simultaneamente com zero latência e CUSTO ZERO (R$ 0,00).
 */

import { Peer, DataConnection } from 'peerjs';
import { ORIGINAL_SCENARIOS } from '../data/scenarios';
import { Category, ScenarioCard } from '../types';
import { 
  P2PLiveRoomState, 
  P2PParticipant, 
  P2PRankingEntry, 
  P2PRoomSettings, 
  P2PRoundAnswer, 
  P2PAggregatedResults, 
  P2PScenarioSummary, 
  P2PStudentMessage, 
  P2PTeacherMessage 
} from './p2pTypes';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];

function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function shuffleArray<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export class P2PRoomHost {
  public roomCode: string;
  public peerId: string;
  private peer: Peer | null = null;
  private settings: P2PRoomSettings;
  private cardList: ScenarioCard[] = [];
  private phase: 'lobby' | 'classifying' | 'justifying' | 'revealing' | 'finished' = 'lobby';
  private currentRoundIndex: number = 0;
  private phaseDeadline?: number;
  private isPaused: boolean = false;
  private timerHandle?: any;

  private participants = new Map<string, P2PParticipant & { conn?: DataConnection }>();
  private answers: P2PRoundAnswer[] = [];
  private onStateChange: (state: P2PLiveRoomState) => void;
  private onStatusChange: (status: 'connecting' | 'ready' | 'error', errorMsg?: string) => void;

  constructor(
    settings: P2PRoomSettings,
    onStateChange: (state: P2PLiveRoomState) => void,
    onStatusChange: (status: 'connecting' | 'ready' | 'error', errorMsg?: string) => void,
    customCode?: string
  ) {
    this.settings = settings;
    this.onStateChange = onStateChange;
    this.onStatusChange = onStatusChange;
    this.roomCode = customCode ? customCode.toUpperCase() : generateRoomCode();
    this.peerId = `RADAR-${this.roomCode}`;

    this.initCards();
    this.initPeer();
  }

  private initCards() {
    const targetCount = Math.min(Math.max(Number(this.settings.cardCount) || 8, 4), 16);
    const effortScenarios = ORIGINAL_SCENARIOS.filter(s => s.expectedCategory === 'esforco');
    const depScenarios = ORIGINAL_SCENARIOS.filter(s => s.expectedCategory === 'dependencia');

    let selected: ScenarioCard[] = [];
    if (this.settings.scenarioFocus === 'effort') {
      const effCount = Math.min(Math.ceil(targetCount * 0.75), effortScenarios.length);
      const depCount = targetCount - effCount;
      selected = [
        ...shuffleArray(effortScenarios).slice(0, effCount),
        ...shuffleArray(depScenarios).slice(0, depCount)
      ];
    } else if (this.settings.scenarioFocus === 'dependency') {
      const depCount = Math.min(Math.ceil(targetCount * 0.75), depScenarios.length);
      const effCount = targetCount - depCount;
      selected = [
        ...shuffleArray(depScenarios).slice(0, depCount),
        ...shuffleArray(effortScenarios).slice(0, effCount)
      ];
    } else if (this.settings.scenarioFocus === 'all') {
      selected = shuffleArray([...ORIGINAL_SCENARIOS]).slice(0, targetCount);
    } else {
      // 'balanced' (50% esforço, 50% dependência)
      const half = Math.floor(targetCount / 2);
      selected = [
        ...shuffleArray(effortScenarios).slice(0, half),
        ...shuffleArray(depScenarios).slice(0, targetCount - half)
      ];
    }

    const finalSelected = shuffleArray(selected).slice(0, targetCount);
    const numWithJust = Math.round(targetCount / 2);

    // Cria array com metade 'true' (com justificativa) e metade 'false' (sem justificativa) em ordem aleatória
    const justificationFlags = shuffleArray([
      ...Array(numWithJust).fill(true),
      ...Array(targetCount - numWithJust).fill(false)
    ]);

    this.cardList = finalSelected.map((card, idx) => {
      const hasJust = justificationFlags[idx];
      return {
        ...card,
        justifications: hasJust
          ? shuffleArray((card.justifications || []).map(j => ({ ...j })))
          : []
      };
    });

    // Emite estado inicial imediatamente
    this.broadcastState();
  }

  private initPeer() {
    this.onStatusChange('connecting');

    // Ambiente sem WebRTC (ex: Node.js em testes unitários)
    if (typeof window === 'undefined' || !(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection)) {
      this.onStatusChange('ready');
      return;
    }

    try {
      this.peer = new Peer(this.peerId, {
        debug: 1,
        config: {
          iceServers: ICE_SERVERS
        }
      });

      this.peer.on('open', () => {
        this.onStatusChange('ready');
        this.broadcastState();
      });

      this.peer.on('disconnected', () => {
        // Reconecta ao servidor de sinalização se a conexão oscilar
        if (this.peer && !this.peer.destroyed) {
          try {
            this.peer.reconnect();
          } catch (e) {}
        }
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });

      this.peer.on('error', (err: any) => {
        console.warn('P2P Host Peer error:', err);
        if (err.type === 'unavailable-id') {
          // ID já em uso, gera outro código
          this.roomCode = generateRoomCode();
          this.peerId = `RADAR-${this.roomCode}`;
          this.peer?.destroy();
          this.initPeer();
        } else {
          this.onStatusChange('error', err?.message || 'Erro na conexão P2P');
        }
      });
    } catch (err: any) {
      this.onStatusChange('error', err?.message || 'Não foi possível inicializar o P2P');
    }
  }

  private handleIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      // Conexão WebRTC aberta com o aluno
    });

    conn.on('data', (data: any) => {
      this.handleStudentMessage(conn, data as P2PStudentMessage);
    });

    conn.on('close', () => {
      // Identifica qual participante desconectou
      for (const [token, p] of this.participants.entries()) {
        if (p.conn === conn) {
          p.isOnline = false;
          p.conn = undefined;
          this.broadcastState();
          break;
        }
      }
    });

    conn.on('error', () => {
      // Silencioso, tratado no 'close'
    });
  }

  private handleStudentMessage(conn: DataConnection, msg: P2PStudentMessage) {
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'JOIN': {
        const cleanNick = (msg.nickname || 'Estudante').trim().slice(0, 24);
        let token = msg.existingToken;

        if (token && this.participants.has(token)) {
          // Reconexão de aluno existente
          const p = this.participants.get(token)!;
          p.isOnline = true;
          p.lastSeen = Date.now();
          p.conn = conn;

          const ack: P2PTeacherMessage = {
            type: 'JOIN_SUCCESS',
            participantToken: token,
            nickname: p.nickname,
            roomCode: this.roomCode
          };
          conn.send(ack);
          this.sendStateToParticipant(token);
          this.broadcastState();
          return;
        }

        // Novo aluno
        token = 'tok_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
        const newParticipant: P2PParticipant & { conn?: DataConnection } = {
          id: token,
          nickname: cleanNick,
          joinedAt: new Date().toISOString(),
          isOnline: true,
          lastSeen: Date.now(),
          conn
        };

        this.participants.set(token, newParticipant);

        const ack: P2PTeacherMessage = {
          type: 'JOIN_SUCCESS',
          participantToken: token,
          nickname: cleanNick,
          roomCode: this.roomCode
        };
        conn.send(ack);
        this.sendStateToParticipant(token);
        this.broadcastState();
        break;
      }

      case 'SUBMIT_CATEGORY': {
        const { participantToken, category, wantsDiscussion } = msg;
        if (!participantToken || !this.participants.has(participantToken)) return;
        if (this.phase !== 'classifying') return;

        let ans = this.answers.find(
          a => a.participantId === participantToken && a.roundIndex === this.currentRoundIndex
        );

        if (!ans) {
          ans = {
            participantId: participantToken,
            roundIndex: this.currentRoundIndex,
            categoryChoice: category,
            wantsDiscussion: Boolean(wantsDiscussion),
            justificationChoiceId: null,
            submittedCategoryAt: Date.now()
          };
          this.answers.push(ans);
        } else {
          ans.categoryChoice = category;
          ans.wantsDiscussion = Boolean(wantsDiscussion);
          ans.submittedCategoryAt = Date.now();
        }

        this.broadcastState();
        break;
      }

      case 'SUBMIT_JUSTIFICATION': {
        const { participantToken, justificationId } = msg;
        if (!participantToken || !this.participants.has(participantToken)) return;
        if (this.phase !== 'justifying') return;

        let ans = this.answers.find(
          a => a.participantId === participantToken && a.roundIndex === this.currentRoundIndex
        );

        if (ans) {
          ans.justificationChoiceId = justificationId;
          ans.submittedJustificationAt = Date.now();
        }

        this.broadcastState();
        break;
      }

      case 'HEARTBEAT': {
        const p = this.participants.get(msg.participantToken);
        if (p) {
          p.lastSeen = Date.now();
          p.isOnline = true;
        }
        break;
      }
    }
  }

  // --- CONTROLES DE RODADA (Executados pelo Professor) ---

  public advancePhase(targetPhase?: 'classifying' | 'justifying' | 'revealing' | 'finished') {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = undefined;
    }

    const currentCard = this.cardList[this.currentRoundIndex];
    const hasJustification = Boolean(currentCard && currentCard.justifications && currentCard.justifications.length > 0);
    const isLastRound = this.currentRoundIndex >= this.cardList.length - 1;

    if (targetPhase) {
      this.phase = targetPhase;
    } else {
      switch (this.phase) {
        case 'lobby':
          this.phase = 'classifying';
          break;
        case 'classifying':
          if (hasJustification) {
            this.phase = 'justifying';
          } else if (isLastRound) {
            // Última rodada sem justificativa: finaliza e abre resultados diretamente
            this.phase = 'finished';
          } else {
            this.phase = 'revealing';
          }
          break;
        case 'justifying':
          if (isLastRound) {
            // Última rodada com justificativa: finaliza e abre resultados diretamente
            this.phase = 'finished';
          } else {
            this.phase = 'revealing';
          }
          break;
        case 'revealing':
          if (this.currentRoundIndex < this.cardList.length - 1) {
            this.currentRoundIndex++;
            this.phase = 'classifying';
          } else {
            this.phase = 'finished';
          }
          break;
        case 'finished':
          return;
      }
    }

    // Configura prazo do cronômetro se aplicável
    if ((this.phase === 'classifying' || this.phase === 'justifying') && this.settings.timerDuration > 0 && !this.isPaused) {
      this.phaseDeadline = Date.now() + this.settings.timerDuration * 1000;
      this.timerHandle = setTimeout(() => {
        this.handleTimerExpired();
      }, this.settings.timerDuration * 1000);
    } else {
      this.phaseDeadline = undefined;
    }

    this.broadcastState();
  }

  private handleTimerExpired() {
    const currentCard = this.cardList[this.currentRoundIndex];
    const hasJustification = Boolean(currentCard && currentCard.justifications && currentCard.justifications.length > 0);
    const isLastRound = this.currentRoundIndex >= this.cardList.length - 1;

    if (this.phase === 'classifying') {
      if (hasJustification) {
        this.advancePhase('justifying');
      } else if (isLastRound) {
        this.advancePhase('finished');
      } else {
        this.advancePhase('revealing');
      }
    } else if (this.phase === 'justifying') {
      if (isLastRound) {
        this.advancePhase('finished');
      } else {
        this.advancePhase('revealing');
      }
    }
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      if (this.timerHandle) {
        clearTimeout(this.timerHandle);
        this.timerHandle = undefined;
      }
    } else if (this.phaseDeadline) {
      const remaining = Math.max(0, this.phaseDeadline - Date.now());
      if (remaining > 0) {
        this.timerHandle = setTimeout(() => {
          this.handleTimerExpired();
        }, remaining);
      } else {
        this.handleTimerExpired();
      }
    }
    this.broadcastState();
  }

  public reopenCurrentRound() {
    this.advancePhase('classifying');
  }

  public kickParticipant(nickname: string) {
    for (const [token, p] of this.participants.entries()) {
      if (p.nickname === nickname) {
        if (p.conn && p.conn.open) {
          p.conn.send({ type: 'KICKED', reason: 'Removido pelo professor' } as P2PTeacherMessage);
          p.conn.close();
        }
        this.participants.delete(token);
        this.broadcastState();
        break;
      }
    }
  }

  public finishRoom() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = undefined;
    }
    this.phase = 'finished';
    this.broadcastState();
  }

  // --- CÁLCULO DE ESTATÍSTICAS E RESUMOS ---

  private computeAggregatedResults(roundIdx: number): P2PAggregatedResults {
    const card = this.cardList[roundIdx];
    const roundAnswers = this.answers.filter(a => a.roundIndex === roundIdx);
    const categoryDistribution: Record<string, number> = {
      esforco: 0,
      dependencia: 0,
      depende_do_contexto: 0,
      discussao: 0
    };
    const justificationDistribution: Record<string, number> = {};

    let correctCount = 0;
    let submittedCount = 0;

    roundAnswers.forEach(a => {
      if (a.categoryChoice) {
        categoryDistribution[a.categoryChoice] = (categoryDistribution[a.categoryChoice] || 0) + 1;
        submittedCount++;
        if (card && a.categoryChoice === card.expectedCategory) {
          correctCount++;
        }
      }
      if (a.wantsDiscussion) {
        categoryDistribution.discussao = (categoryDistribution.discussao || 0) + 1;
      }
      if (a.justificationChoiceId) {
        justificationDistribution[a.justificationChoiceId] = 
          (justificationDistribution[a.justificationChoiceId] || 0) + 1;
      }
    });

    const accuracyPercent = submittedCount > 0 ? Math.round((correctCount / submittedCount) * 100) : 0;
    const goalMet = accuracyPercent >= this.settings.goal;

    return {
      submittedCount,
      categoryDistribution,
      justificationDistribution,
      expectedCategory: card?.expectedCategory,
      accuracyPercent,
      goalMet
    };
  }

  private computeScenariosSummary(): P2PScenarioSummary[] {
    return this.cardList.map((card, idx) => {
      const agg = this.computeAggregatedResults(idx);
      const totalAnswers = agg.submittedCount;
      const correctCount = this.answers.filter(
        a => a.roundIndex === idx && a.categoryChoice === card.expectedCategory
      ).length;

      const justifications = (card.justifications || []).map(j => {
        const votes = agg.justificationDistribution[j.id] || 0;
        const percent = totalAnswers > 0 ? Math.round((votes / totalAnswers) * 100) : 0;
        return {
          id: j.id,
          text: j.text,
          isExpected: j.isExpected,
          explanation: j.explanation,
          votes,
          percent
        };
      });

      return {
        cardId: card.id,
        scenarioText: card.text,
        text: card.text,
        originPage: card.originPage,
        expectedCategory: card.expectedCategory,
        hasJustification: Boolean(card.justifications && card.justifications.length > 0),
        totalAnswers,
        categoryDistribution: agg.categoryDistribution,
        justifications,
        shortExplanation: card.shortExplanation
      };
    });
  }

  private computeRanking(participantToken?: string): P2PRankingEntry[] {
    const list: P2PRankingEntry[] = [];
    const hasJust = this.cardList.some(c => c.justifications && c.justifications.length > 0);

    for (const [token, p] of this.participants.entries()) {
      let categoryPoints = 0;
      let justificationPoints = 0;
      let correctCategoriesCount = 0;
      let correctJustificationsCount = 0;
      let discussions = 0;
      const participantAnswers = this.answers.filter(a => a.participantId === token);

      participantAnswers.forEach(a => {
        const card = this.cardList[a.roundIndex];
        if (!card) return;

        if (a.categoryChoice === card.expectedCategory) {
          // 100 pts se rodada não tiver justificativa, ou 40 pts se tiver
          const cardHasJust = Boolean(card.justifications && card.justifications.length > 0);
          const pts = cardHasJust ? 40 : 100;
          categoryPoints += pts;
          correctCategoriesCount++;
        }
        if (a.justificationChoiceId) {
          const expectedJust = card.justifications.find(j => j.isExpected);
          if (expectedJust && a.justificationChoiceId === expectedJust.id) {
            justificationPoints += 60;
            correctJustificationsCount++;
          }
        }
        if (a.wantsDiscussion) {
          discussions++;
        }
      });

      const totalScore = categoryPoints + justificationPoints;
      const accuracy = this.cardList.length > 0 ? Math.round((correctCategoriesCount / this.cardList.length) * 100) : 0;

      list.push({
        nickname: p.nickname,
        score: totalScore,
        totalScore,
        accuracy,
        correctCount: correctCategoriesCount,
        correctCategoriesCount,
        correctJustificationsCount,
        categoryPoints,
        justificationPoints,
        totalAnswers: participantAnswers.length,
        discussions,
        rank: 0,
        isCurrentUser: participantToken ? token === participantToken : false
      });
    }

    list.sort((a, b) => b.totalScore - a.totalScore || b.accuracy - a.accuracy);
    list.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    return list;
  }

  // --- ENVIO DE ESTADOS VIA WEBRTC ---

  private buildTeacherState(): P2PLiveRoomState {
    const currentCard = this.cardList[this.currentRoundIndex];
    const hasJustification = Boolean(currentCard && currentCard.justifications && currentCard.justifications.length > 0);
    const aggregatedResults = this.computeAggregatedResults(this.currentRoundIndex);
    const ranking = this.computeRanking();
    const scenariosSummary = (this.phase === 'revealing' || this.phase === 'finished') 
      ? this.computeScenariosSummary() 
      : undefined;

    const participantsArray = Array.from(this.participants.values()).map(p => ({
      nickname: p.nickname,
      isOnline: p.isOnline
    }));

    return {
      roomCode: this.roomCode,
      phase: this.phase,
      hasJustification,
      currentRoundIndex: this.currentRoundIndex,
      totalRounds: this.cardList.length,
      currentCard,
      settings: this.settings,
      participantsCount: this.participants.size,
      participants: participantsArray,
      phaseDeadline: this.phaseDeadline,
      isPaused: this.isPaused,
      aggregatedResults,
      ranking,
      scenariosSummary,
      isP2P: true,
      connectedPeersCount: Array.from(this.participants.values()).filter(p => p.isOnline).length
    };
  }

  private buildStudentState(participantToken: string): P2PLiveRoomState {
    const currentCard = this.cardList[this.currentRoundIndex];
    const hasJustification = Boolean(currentCard && currentCard.justifications && currentCard.justifications.length > 0);
    let safeCard: Partial<ScenarioCard> | undefined = undefined;

    if (currentCard) {
      if (this.phase === 'revealing' || this.phase === 'finished') {
        safeCard = currentCard;
      } else if (this.phase === 'classifying') {
        safeCard = {
          id: currentCard.id,
          text: currentCard.text,
          originPage: currentCard.originPage,
          source: currentCard.source,
          version: currentCard.version,
          contextNote: currentCard.contextNote
        };
      } else if (this.phase === 'justifying') {
        safeCard = {
          id: currentCard.id,
          text: currentCard.text,
          justifications: currentCard.justifications.map(j => ({
            id: j.id,
            text: j.text,
            isExpected: false, // Ocultado do aluno
            explanation: ''    // Ocultado do aluno
          }))
        };
      }
    }

    const aggregatedResults = (this.phase === 'revealing' || this.phase === 'finished') 
      ? this.computeAggregatedResults(this.currentRoundIndex)
      : undefined;

    const ranking = (this.phase === 'revealing' || this.phase === 'finished') 
      ? this.computeRanking(participantToken)
      : undefined;

    const participantAnswer = this.answers.find(
      a => a.participantId === participantToken && a.roundIndex === this.currentRoundIndex
    );

    const participantsArray = Array.from(this.participants.values()).map(p => ({
      nickname: p.nickname,
      isOnline: p.isOnline
    }));

    return {
      roomCode: this.roomCode,
      phase: this.phase,
      hasJustification,
      currentRoundIndex: this.currentRoundIndex,
      totalRounds: this.cardList.length,
      currentCard: safeCard,
      settings: this.settings,
      participantsCount: this.participants.size,
      participants: participantsArray,
      phaseDeadline: this.phaseDeadline,
      isPaused: this.isPaused,
      aggregatedResults,
      userAnswer: participantAnswer ? {
        categoryChoice: participantAnswer.categoryChoice,
        wantsDiscussion: participantAnswer.wantsDiscussion,
        justificationChoiceId: participantAnswer.justificationChoiceId
      } : undefined,
      ranking,
      isP2P: true
    };
  }

  private sendStateToParticipant(participantToken: string) {
    const p = this.participants.get(participantToken);
    if (p && p.conn && p.conn.open) {
      const studentState = this.buildStudentState(participantToken);
      const msg: P2PTeacherMessage = {
        type: 'ROOM_UPDATE',
        state: studentState
      };
      p.conn.send(msg);
    }
  }

  public broadcastState() {
    // 1. Atualiza tela do professor
    const teacherState = this.buildTeacherState();
    this.onStateChange(teacherState);

    // 2. Envia para cada estudante conectado via WebRTC DataChannel
    for (const [token, p] of this.participants.entries()) {
      if (p.conn && p.conn.open) {
        const studentState = this.buildStudentState(token);
        const msg: P2PTeacherMessage = {
          type: 'ROOM_UPDATE',
          state: studentState
        };
        p.conn.send(msg);
      }
    }
  }

  // Gera e faz download do arquivo CSV diretamente no navegador sem precisar de servidor
  public exportCsv(): string {
    const rows: string[][] = [];
    rows.push(['Ranking', 'Estudante', 'Pontuação Total', 'Classificações Corretas', 'Justificativas Corretas', 'Discussões']);
    const ranking = this.computeRanking();
    ranking.forEach(r => {
      rows.push([
        String(r.rank),
        r.nickname,
        String(r.totalScore),
        `${r.correctCategoriesCount}/${this.cardList.length}`,
        `${r.correctJustificationsCount}/${this.cardList.length}`,
        String(r.discussions)
      ]);
    });
    return rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  public destroy() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
    }
    for (const p of this.participants.values()) {
      if (p.conn) {
        try { p.conn.close(); } catch (e) {}
      }
    }
    this.participants.clear();
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
  }
}
