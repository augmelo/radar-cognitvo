/**
 * Radar Cognitivo - Tela do Estudante na Sala ao Vivo via P2P WebRTC
 * Entrada com código de 6 caracteres ou QR Code, conexão direta ao vivo com o professor,
 * cronômetro sincronizado com efeitos sonoros e CUSTO ZERO (R$ 0,00).
 */

import React, { useState, useEffect, useRef } from 'react';
import { Users, Brain, Bot, Clock, ArrowRight, CheckCircle2, Trophy, AlertTriangle, Wifi, Radio } from 'lucide-react';
import { Category } from '../types';
import { soundEffects } from '../utils/audio';
import { StartLogo } from './StartLogo';
import { P2PRoomClient } from '../engine/p2pClient';
import { P2PLiveRoomState } from '../engine/p2pTypes';

interface StudentLiveRoomProps {
  initialRoomCode?: string;
  onExit: () => void;
}

export const StudentLiveRoom: React.FC<StudentLiveRoomProps> = ({
  initialRoomCode = '',
  onExit
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [nickname, setNickname] = useState('');
  const [joined, setJoined] = useState(false);
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Estado da sala sincronizado via WebRTC direto do professor
  const [roomState, setRoomState] = useState<P2PLiveRoomState | null>(null);
  const [hasVotedCategory, setHasVotedCategory] = useState(false);
  const [hasVotedJustification, setHasVotedJustification] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedJustId, setSelectedJustId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const clientRef = useRef<P2PRoomClient | null>(null);
  const lastTickPlayedRef = useRef<number | null>(null);

  // Relógio de contagem regressiva para o aluno nas etapas de classificação e justificativa
  useEffect(() => {
    if ((roomState?.phase === 'classifying' || roomState?.phase === 'justifying') && roomState?.phaseDeadline) {
      const update = () => {
        const remaining = Math.max(0, Math.ceil((roomState.phaseDeadline! - Date.now()) / 1000));
        setCountdown(remaining);
      };
      update();
      const interval = setInterval(update, 250);
      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [roomState?.phase, roomState?.phaseDeadline]);

  // Efeito sonoro nos últimos 5 segundos e quando o tempo zera
  useEffect(() => {
    if (countdown !== null) {
      if (countdown <= 5 && countdown > 0 && lastTickPlayedRef.current !== countdown) {
        lastTickPlayedRef.current = countdown;
        soundEffects.playCountdownTick(countdown);
      } else if (countdown === 0 && lastTickPlayedRef.current !== 0) {
        lastTickPlayedRef.current = 0;
        soundEffects.playTimeUpAlert();
      }
    } else {
      lastTickPlayedRef.current = null;
    }
  }, [countdown]);

  // Cronômetro decorrido se a sala for sem tempo limite
  useEffect(() => {
    if (roomState?.phase === 'classifying' || roomState?.phase === 'justifying') {
      setElapsedSeconds(0);
      const interval = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomState?.currentRoundIndex, roomState?.phase]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Verifica se já existia token de reconexão salvo para essa sala
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      const savedToken = sessionStorage.getItem(`radar_live_token_${initialRoomCode.toUpperCase()}`);
      const savedNick = sessionStorage.getItem(`radar_live_nick_${initialRoomCode.toUpperCase()}`);
      if (savedToken && savedNick) {
        setNickname(savedNick);
        attemptJoin(initialRoomCode.toUpperCase(), savedNick, savedToken);
      }
    }
  }, [initialRoomCode]);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, []);

  const attemptJoin = (code: string, nick: string, existingToken?: string) => {
    setErrorMsg('');
    setIsConnecting(true);

    if (clientRef.current) {
      clientRef.current.destroy();
      clientRef.current = null;
    }

    const client = new P2PRoomClient(code, {
      onStatusChange: (status, message) => {
        if (status === 'connecting') {
          setIsConnecting(true);
        } else if (status === 'connected') {
          setIsConnecting(false);
          setErrorMsg('');
        } else if (status === 'error') {
          setIsConnecting(false);
          setErrorMsg(message || 'Erro ao conectar à sala.');
        } else if (status === 'disconnected') {
          setIsConnecting(false);
        }
      },
      onJoined: (info) => {
        setIsConnecting(false);
        setParticipantToken(info.participantToken);
        setJoined(true);
        sessionStorage.setItem(`radar_live_token_${code}`, info.participantToken);
        sessionStorage.setItem(`radar_live_nick_${code}`, nick);
      },
      onStateUpdate: (state) => {
        setRoomState(state);

        // Atualiza estado de resposta do estudante
        if (state.userAnswer) {
          if (state.userAnswer.categoryChoice) setHasVotedCategory(true);
          if (state.userAnswer.justificationChoiceId) setHasVotedJustification(true);
        } else {
          // Nova rodada iniciou
          if (state.phase === 'classifying' && roomState?.phase !== 'classifying') {
            setHasVotedCategory(false);
            setHasVotedJustification(false);
            setSelectedCategory(null);
            setSelectedJustId(null);
          }
        }
      },
      onKicked: (reason) => {
        setErrorMsg(reason || 'Você foi desconectado da sala pelo professor.');
        setJoined(false);
      }
    });

    clientRef.current = client;
    client.join(nick, existingToken);
  };

  const handleJoinForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !nickname.trim()) {
      setErrorMsg('Informe o código da sala e seu nome.');
      return;
    }
    attemptJoin(roomCode.trim().toUpperCase(), nickname.trim());
  };

  const handleSubmitClassification = () => {
    if (!selectedCategory || !clientRef.current) return;
    soundEffects.playTap();
    clientRef.current.submitCategory(selectedCategory, false);
    setHasVotedCategory(true);
  };

  const handleSubmitJustification = () => {
    if (!selectedJustId || !clientRef.current) return;
    soundEffects.playTap();
    clientRef.current.submitJustification(selectedJustId);
    setHasVotedJustification(true);
  };

  // Se ainda não entrou na sala
  if (!joined) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <StartLogo size="lg" />
            </div>
            <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Entrar em Sala de Aula
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Participe da rodada ao vivo com a sua turma informando o código da sala.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleJoinForm} className="space-y-4">
            <div>
              <label htmlFor="room-code-input" className="block text-xs font-bold text-stone-700 mb-1">
                Código da Sala (6 caracteres):
              </label>
              <input
                id="room-code-input"
                type="text"
                placeholder="Ex: RAD742"
                maxLength={8}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full p-3.5 text-base font-mono tracking-widest uppercase bg-stone-50 border border-stone-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF] focus-visible:border-transparent font-bold text-stone-900"
              />
            </div>

            <div>
              <label htmlFor="room-nick-input" className="block text-xs font-bold text-stone-700 mb-1">
                Nome do Estudante:
              </label>
              <input
                id="room-nick-input"
                type="text"
                maxLength={30}
                placeholder="Ex: Ana Silva, Lucas Costa..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full p-3.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF] focus-visible:border-transparent font-medium"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Informe seu nome para ser identificado na sala e no ranking da turma.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onExit}
                className="text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-60 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>{isConnecting ? 'Conectando...' : 'Conectar à Sala'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Componente de Apelo Visual Alto para o Cronômetro do Estudante
  const renderStudentTimer = () => {
    if (countdown !== null) {
      const isUrgent = countdown <= 5;
      const isWarning = countdown > 5 && countdown <= 10;

      return (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-200 shadow-xs ${
            isUrgent
              ? 'bg-red-600 text-white border-red-700 scale-105 animate-pulse ring-4 ring-red-400/40 shadow-red-200'
              : isWarning
              ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
        >
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 animate-bounce shrink-0" />
          ) : (
            <Clock className="w-4 h-4 shrink-0" />
          )}
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 leading-none">
              {isUrgent ? 'Atenção!' : 'Tempo'}
            </span>
            <span className="text-base sm:text-lg font-black font-mono tabular-nums leading-tight">
              {countdown}s
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono text-stone-600 bg-stone-100 border border-stone-200">
        <Clock className="w-4 h-4 text-stone-400 shrink-0" />
        <span>{formatElapsed(elapsedSeconds)}</span>
      </div>
    );
  };

  // Se já está conectado à sala
  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      {/* Topo da Sala */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-stone-200 shadow-xs mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-xs">
            {roomCode.slice(0, 3)}
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900">
              Sala {roomCode}
            </div>
            <div className="text-[11px] text-stone-500">
              Participando como: <strong>{nickname}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ao Vivo</span>
          </span>
          <button
            onClick={onExit}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 py-1"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Fase 1: Lobby de Espera */}
      {roomState?.phase === 'lobby' && (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-stone-900">
            Você está no lobby da sala!
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
            Aguarde o professor iniciar a atividade na tela principal da sala.
            A tela mudará automaticamente quando a primeira rodada começar.
          </p>
          <div className="text-[11px] text-stone-400 pt-4 border-t border-stone-100">
            {roomState.participantsCount} participante(s) conectados no momento.
          </div>
        </div>
      )}

      {/* Fase 2: Classificando */}
      {roomState?.phase === 'classifying' && roomState.currentCard && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                Cenário {roomState.currentRoundIndex + 1} de {roomState.totalRounds}
              </span>
              <span className="text-xs font-bold text-indigo-700">
                Etapa: Classificação da Ação
                {roomState.hasJustification === false && (
                  <span className="ml-2 font-semibold text-stone-500 text-[11px] bg-stone-100 px-2 py-0.5 rounded-md">
                    Sem justificativa nesta rodada
                  </span>
                )}
              </span>
            </div>

            {/* Cronômetro com Grande Apelo Visual */}
            {renderStudentTimer()}
          </div>

          <div className="p-5 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              "{roomState.currentCard.text}"
            </p>
          </div>

          {!hasVotedCategory ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('esforco')}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    selectedCategory === 'esforco'
                      ? 'bg-blue-600 text-white font-bold ring-4 ring-blue-600/30 shadow-md border-blue-600 scale-[1.02]'
                      : 'bg-white border-stone-200 text-stone-800 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <Brain className={`w-7 h-7 mx-auto mb-2 ${selectedCategory === 'esforco' ? 'text-white' : 'text-blue-600'}`} />
                  <div className="text-sm font-bold">Esforço Cognitivo</div>
                  <div className={`text-[11px] mt-1 ${selectedCategory === 'esforco' ? 'text-blue-100' : 'text-stone-500'}`}>
                    O aluno pensa e decide
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('dependencia')}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    selectedCategory === 'dependencia'
                      ? 'bg-amber-600 text-white font-bold ring-4 ring-amber-600/30 shadow-md border-amber-600 scale-[1.02]'
                      : 'bg-white border-stone-200 text-stone-800 hover:border-amber-300 hover:bg-amber-50/30'
                  }`}
                >
                  <Bot className={`w-7 h-7 mx-auto mb-2 ${selectedCategory === 'dependencia' ? 'text-white' : 'text-amber-600'}`} />
                  <div className="text-sm font-bold">Dependência Cognitiva</div>
                  <div className={`text-[11px] mt-1 ${selectedCategory === 'dependencia' ? 'text-amber-100' : 'text-stone-500'}`}>
                    Terceiriza para a máquina
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitClassification}
                disabled={!selectedCategory}
                className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold rounded-xl disabled:opacity-30 transition-all shadow-xs"
              >
                Confirmar Voto
              </button>
            </div>
          ) : (
            <div className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-base font-bold text-stone-900">Voto Confirmado!</div>
              <p className="text-xs text-stone-500">
                {roomState?.hasJustification !== false
                  ? 'Aguarde o professor avançar para a etapa de justificativas na sala.'
                  : (roomState && roomState.currentRoundIndex + 1 >= roomState.totalRounds
                      ? 'Último cenário respondido! Aguarde o professor finalizar as rodadas para ver o resultado final.'
                      : 'Aguarde o professor avançar para a revelação dos resultados.')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fase 3: Justificativa */}
      {roomState?.phase === 'justifying' && roomState.currentCard?.justifications && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                Cenário {roomState.currentRoundIndex + 1} de {roomState.totalRounds}
              </span>
              <span className="text-xs font-bold text-sky-700">
                Etapa: Justificativa da Ação
              </span>
            </div>

            {/* Cronômetro com Grande Apelo Visual na Justificativa */}
            {renderStudentTimer()}
          </div>

          {/* Cenário Apresentado Anteriormente */}
          {roomState.currentCard?.text && (
            <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Cenário em Análise
              </span>
              <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                "{roomState.currentCard.text}"
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
              Qual das opções abaixo melhor justifica essa atitude?
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Escolha a alternativa pedagógica que explica por que a ação descrita no cenário acima representa esforço ou dependência cognitiva:
            </p>
          </div>

          {!hasVotedJustification ? (
            <div className="space-y-3">
              {roomState.currentCard.justifications.map((just: any, idx: number) => (
                <button
                  key={just.id}
                  onClick={() => setSelectedJustId(just.id)}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${
                    selectedJustId === just.id
                      ? 'border-[#38B6FF] bg-sky-50/70 font-semibold ring-2 ring-[#38B6FF] shadow-xs'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300 hover:bg-stone-50/50'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{just.text}</span>
                </button>
              ))}

              <button
                onClick={handleSubmitJustification}
                disabled={!selectedJustId}
                className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold rounded-xl disabled:opacity-30 transition-all shadow-xs mt-2"
              >
                Enviar Justificativa
              </button>
            </div>
          ) : (
            <div className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-base font-bold text-stone-900">Justificativa Enviada!</div>
              <p className="text-xs text-stone-500">
                {roomState && roomState.currentRoundIndex + 1 >= roomState.totalRounds
                  ? 'Último cenário respondido! Aguarde o professor finalizar as rodadas para ver o resultado final da turma.'
                  : 'Aguarde o professor avançar a rodada para revelar a distribuição da turma na sala.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fase 4: Revelando Resultados */}
      {roomState?.phase === 'revealing' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          {/* Cabeçalho da Rodada e Gabarito Oficial */}
          <div className="space-y-3 pb-4 border-b border-stone-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Cenário {roomState.currentRoundIndex + 1} de {roomState.totalRounds}
              </span>
              {roomState.aggregatedResults?.expectedCategory && (
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                    roomState.aggregatedResults.expectedCategory === 'esforco'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span className="font-semibold text-stone-500">Gabarito Oficial:</span>
                  <span className="font-bold">
                    {roomState.aggregatedResults.expectedCategory === 'esforco'
                      ? 'Esforço Cognitivo'
                      : 'Dependência Cognitiva'}
                  </span>
                </span>
              )}
            </div>

            {/* Texto do Cenário */}
            {roomState.currentCard?.text && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  "{roomState.currentCard.text}"
                </p>
              </div>
            )}
          </div>

          {/* BADGE DESTACANDO A SUA COLOCAÇÃO E PONTUAÇÃO ATUAL */}
          {(() => {
            const myRank = roomState.ranking?.find((r: any) => r.isCurrentUser);
            if (!myRank) return null;
            return (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 text-white shadow-sm flex items-center justify-between gap-4 border border-indigo-900/50">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-2xl shrink-0">
                    {myRank.rank === 1 ? '🥇' : myRank.rank === 2 ? '🥈' : myRank.rank === 3 ? '🥉' : '🎖️'}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-bold">
                      Sua Colocação Atual
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white">
                      {myRank.rank}º Lugar
                      <span className="text-xs font-normal text-indigo-200 ml-2">
                        (de {roomState.ranking?.length || 1} {(roomState.ranking?.length || 1) === 1 ? 'estudante' : 'estudantes'})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] uppercase tracking-wider text-indigo-200 font-bold">
                    Pontuação Acumulada
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#38B6FF]">
                    {myRank.totalScore} <span className="text-xs font-bold text-white">pts</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* FEEDBACK DO SEU PRÓPRIO VOTO */}
          <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3">
            <div className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center justify-between">
              <span>Feedback do Seu Voto nesta Rodada:</span>
              <span className="text-[11px] font-semibold text-stone-500">
                {roomState.hasJustification ? 'Rodada com Justificativa' : 'Rodada de Classificação Direta'}
              </span>
            </div>

            {roomState.userAnswer?.categoryChoice ? (
              <div className="space-y-2">
                {/* Voto de Classificação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-stone-200 text-xs">
                  <div>
                    <span className="font-semibold text-stone-600">Sua Classificação: </span>
                    <span className="font-bold text-stone-900">
                      {roomState.userAnswer.categoryChoice === 'esforco'
                        ? 'Esforço Cognitivo'
                        : 'Dependência Cognitiva'}
                    </span>
                  </div>
                  {roomState.aggregatedResults?.expectedCategory && (
                    roomState.userAnswer.categoryChoice === roomState.aggregatedResults.expectedCategory ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acertou a Classificação! (+{roomState.hasJustification ? 40 : 100} pts)</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                        Classificação Incorreta (0 pts)
                      </span>
                    )
                  )}
                </div>

                {/* Voto de Justificativa (se aplicável na rodada) */}
                {roomState.hasJustification ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-stone-200 text-xs">
                    <div>
                      <span className="font-semibold text-stone-600">Sua Justificativa: </span>
                      <span className="font-medium text-stone-900">
                        {roomState.userAnswer?.justificationChoiceId
                          ? (roomState.currentCard?.justifications?.find((j: any) => j.id === roomState.userAnswer?.justificationChoiceId)?.text || 'Alternativa selecionada')
                          : 'Não respondeu a justificativa a tempo'}
                      </span>
                    </div>
                    {(() => {
                      const justId = roomState.userAnswer?.justificationChoiceId;
                      if (!justId) {
                        return (
                          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-lg">
                            Não enviou (0 pts)
                          </span>
                        );
                      }
                      const chosenJust = roomState.currentCard?.justifications?.find((j: any) => j.id === justId);
                      const isCorrect = chosenJust?.isExpected;
                      return isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Justificativa Correta! (+60 pts)</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          Distrator selecionado (0 pts)
                        </span>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-[11px] text-stone-500 bg-white p-3 rounded-xl border border-stone-200">
                    ℹ️ <strong>Alternância Pedagógica:</strong> Esta rodada não possuiu etapa de justificativa. A pontuação máxima da classificação foi de 100 pontos.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-500">
                Você não enviou voto a tempo nesta rodada (0 pontos computados).
              </div>
            )}
          </div>

          {/* DISTRIBUIÇÃO DE VOTOS DA TURMA */}
          {roomState.aggregatedResults && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-stone-700">
                Distribuição de Votos da Sala ({roomState.aggregatedResults.submittedCount} respostas recebidas):
              </div>
              {/* Barra Esforço */}
              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    Esforço Cognitivo
                  </span>
                  <span className="font-bold">
                    {roomState.aggregatedResults.categoryDistribution.esforco || 0} votos (
                    {roomState.aggregatedResults.submittedCount > 0
                      ? Math.round(
                          ((roomState.aggregatedResults.categoryDistribution.esforco || 0) /
                            roomState.aggregatedResults.submittedCount) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        roomState.aggregatedResults.submittedCount > 0
                          ? ((roomState.aggregatedResults.categoryDistribution.esforco || 0) /
                              roomState.aggregatedResults.submittedCount) *
                            100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              {/* Barra Dependência */}
              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    Dependência Cognitiva
                  </span>
                  <span className="font-bold">
                    {roomState.aggregatedResults.categoryDistribution.dependencia || 0} votos (
                    {roomState.aggregatedResults.submittedCount > 0
                      ? Math.round(
                          ((roomState.aggregatedResults.categoryDistribution.dependencia || 0) /
                            roomState.aggregatedResults.submittedCount) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        roomState.aggregatedResults.submittedCount > 0
                          ? ((roomState.aggregatedResults.categoryDistribution.dependencia || 0) /
                              roomState.aggregatedResults.submittedCount) *
                            100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TABELA COM O RANKING DA SALA ATÉ AQUELE MOMENTO */}
          {roomState.ranking && roomState.ranking.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Ranking da Turma até o Momento
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Pontuação e posições acumuladas até a Rodada {roomState.currentRoundIndex + 1} de {roomState.totalRounds}
                  </p>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-2.5 w-16">Posição</th>
                      <th className="p-2.5">Nome do Estudante</th>
                      <th className="p-2.5 text-right">Classif.</th>
                      <th className="p-2.5 text-right">Justif.</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {roomState.ranking.map((item: any, idx: number) => (
                      <tr
                        key={`${item.nickname}-${item.rank}-${idx}`}
                        className={item.isCurrentUser ? 'bg-indigo-50/80 font-bold' : 'hover:bg-stone-50'}
                      >
                        <td className="p-2.5 font-mono">
                          {item.rank === 1 ? '🥇 1º' : item.rank === 2 ? '🥈 2º' : item.rank === 3 ? '🥉 3º' : `${item.rank}º`}
                        </td>
                        <td className="p-2.5">
                          <span className="text-stone-900">{item.nickname}</span>
                          {item.isCurrentUser && (
                            <span className="ml-1.5 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-semibold">
                              Você
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right tabular-nums text-stone-600">
                          {item.correctCategoriesCount}/{item.totalAnswers ?? (roomState.currentRoundIndex + 1)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums text-stone-600">
                          {item.correctJustificationsCount}/{item.totalAnswers ?? (roomState.currentRoundIndex + 1)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums text-indigo-700 font-bold">
                          {item.totalScore} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-center pt-2 text-xs text-stone-500 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Aguarde o professor avançar para a próxima rodada no projetor...</span>
          </div>
        </div>
      )}

      {/* Fase 5: Finalizada com Ranking da Turma */}
      {roomState?.phase === 'finished' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="text-center space-y-2 pb-4 border-b border-stone-100">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Ranking Final da Atividade
            </h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Pontuação calculada com 40 pts por classificação esperada e 60 pts por justificativa esperada.
            </p>
          </div>

          {/* Tabela do Ranking de Estudantes */}
          {roomState.ranking && roomState.ranking.length > 0 ? (
            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3 w-16">Posição</th>
                    <th className="p-3">Estudante</th>
                    <th className="p-3 text-right">Classificações</th>
                    <th className="p-3 text-right">Justificativas</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {roomState.ranking.map((item: any, idx: number) => (
                    <tr
                      key={`${item.nickname}-${item.rank}-${idx}`}
                      className={item.isCurrentUser ? 'bg-indigo-50/80 font-bold' : 'hover:bg-stone-50'}
                    >
                      <td className="p-3 font-mono">
                        {item.rank === 1 ? '🥇 1º' : item.rank === 2 ? '🥈 2º' : item.rank === 3 ? '🥉 3º' : `${item.rank}º`}
                      </td>
                      <td className="p-3">
                        <span className="text-stone-900">{item.nickname}</span>
                        {item.isCurrentUser && (
                          <span className="ml-2 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-semibold">
                            Você
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right tabular-nums text-stone-600">
                        {item.correctCategoriesCount}/{item.totalAnswers ?? roomState.totalRounds}
                      </td>
                      <td className="p-3 text-right tabular-nums text-stone-600">
                        {item.correctJustificationsCount}/{item.totalAnswers ?? roomState.totalRounds}
                      </td>
                      <td className="p-3 text-right tabular-nums text-indigo-700 font-bold text-sm">
                        {item.totalScore} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
              Nenhuma resposta registrada nesta sessão.
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <button
              onClick={onExit}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
