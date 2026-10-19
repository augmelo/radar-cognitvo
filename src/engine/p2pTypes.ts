/**
 * Radar Cognitivo - Definições de Tipos para WebRTC P2P
 * Comunicação direta entre o navegador do Professor (Host) e os Alunos (Peers)
 * Custo ZERO e sem dependência de banco de dados central.
 */

import { Category, ScenarioCard } from '../types';

export type RoomPhase = 
  | 'lobby'
  | 'classifying'
  | 'justifying'
  | 'revealing'
  | 'finished';

export type RoomMode = 'classification' | 'discussion';

export interface P2PParticipant {
  id: string; // opaque token
  nickname: string;
  joinedAt: string;
  isOnline: boolean;
  lastSeen: number;
}

export interface P2PRoundAnswer {
  participantId: string;
  roundIndex: number;
  categoryChoice: Category | 'depende_do_contexto' | null;
  wantsDiscussion: boolean;
  justificationChoiceId: string | null;
  submittedCategoryAt?: number;
  submittedJustificationAt?: number;
}

export interface P2PRoomSettings {
  cardCount: number;
  timerDuration: number; // 0 = sem cronômetro
  goal: number;          // percentual da meta coletiva (ex: 80)
  mode: RoomMode;
  scenarioFocus?: 'balanced' | 'effort' | 'dependency' | 'all';
}

export interface P2PRankingEntry {
  nickname: string;
  score: number;
  totalScore: number;
  accuracy: number;
  correctCount: number;
  correctCategoriesCount: number;
  correctJustificationsCount: number;
  categoryPoints: number;
  justificationPoints: number;
  totalAnswers: number;
  discussions: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface P2PScenarioSummary {
  cardId: string;
  scenarioText: string;
  text: string;
  originPage: number;
  expectedCategory: Category;
  hasJustification: boolean;
  totalAnswers: number;
  categoryDistribution: Record<string, number>;
  justifications: Array<{
    id: string;
    text: string;
    isExpected: boolean;
    explanation: string;
    votes: number;
    percent: number;
  }>;
  shortExplanation: string;
}

export interface P2PAggregatedResults {
  submittedCount: number;
  categoryDistribution: Record<string, number>;
  justificationDistribution: Record<string, number>;
  expectedCategory?: Category;
  accuracyPercent?: number;
  goalMet?: boolean;
}

export interface P2PLiveRoomState {
  roomCode: string;
  phase: RoomPhase;
  hasJustification: boolean;
  currentRoundIndex: number;
  totalRounds: number;
  currentCard?: Partial<ScenarioCard>;
  settings: P2PRoomSettings;
  participantsCount: number;
  participants: Array<{ nickname: string; isOnline: boolean }>;
  phaseDeadline?: number;
  isPaused: boolean;
  aggregatedResults?: P2PAggregatedResults;
  userAnswer?: {
    categoryChoice: Category | 'depende_do_contexto' | null;
    wantsDiscussion: boolean;
    justificationChoiceId: string | null;
  };
  ranking?: P2PRankingEntry[];
  scenariosSummary?: P2PScenarioSummary[];
  isP2P: boolean;
  connectedPeersCount?: number;
}

// Mensagens enviadas do Estudante para o Professor
export type P2PStudentMessage =
  | { type: 'JOIN'; nickname: string; existingToken?: string }
  | { type: 'SUBMIT_CATEGORY'; participantToken: string; category: Category | 'depende_do_contexto' | null; wantsDiscussion: boolean }
  | { type: 'SUBMIT_JUSTIFICATION'; participantToken: string; justificationId: string }
  | { type: 'HEARTBEAT'; participantToken: string };

// Mensagens enviadas do Professor para o Estudante
export type P2PTeacherMessage =
  | { type: 'JOIN_SUCCESS'; participantToken: string; nickname: string; roomCode: string }
  | { type: 'JOIN_ERROR'; error: string }
  | { type: 'ROOM_UPDATE'; state: P2PLiveRoomState }
  | { type: 'KICKED'; reason?: string };
