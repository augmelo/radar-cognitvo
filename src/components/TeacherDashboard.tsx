/**
 * Radar Cognitivo - Painel do Educador e Condução de Sala ao Vivo
 * 
 * Permite criação de salas customizadas (quantidade de cenários, cronômetro e meta coletiva).
 * Conduz rodadas em tempo real com máquina de estados autoritativa, gráficos de distribuição
 * acessíveis com percentuais e, ao finalizar, exibição do ranking geral e consulta detalhada
 * do desempenho dos estudantes por cenário com gráficos.
 * 
 * Sem alertas nativos (alert/confirm) para total compatibilidade com iframes.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, RotateCcw, CheckCircle2, Shield, Trophy, BarChart3,
  X, ArrowRight, Check, Clock, Sliders, Target, AlertTriangle, Monitor,
  QrCode, Radio, Wifi
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StartLogo } from './StartLogo';
import { P2PRoomHost } from '../engine/p2pHost';
import { P2PLiveRoomState } from '../engine/p2pTypes';

interface TeacherDashboardProps {
  onBack: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack }) => {
  // Customizações da Criação de Sala
  const [roomCardCount, setRoomCardCount] = useState<number>(8);
  const [roomTimer, setRoomTimer] = useState<number>(0);
  const [roomGoal, setRoomGoal] = useState<number>(80);
  const [createErrorMsg, setCreateErrorMsg] = useState<string>('');

  // Estado da Sala Ativa
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<P2PLiveRoomState | null>(null);
  const [p2pStatus, setP2pStatus] = useState<'idle' | 'connecting' | 'ready' | 'error'>('idle');

  // Modal de confirmação para encerrar sala (evita window.confirm no iframe)
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [isClosingRoom, setIsClosingRoom] = useState<boolean>(false);

  // Cronômetro do Professor
  const [countdown, setCountdown] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Aba da tela de encerramento: ranking ou cenários com gráficos
  const [finishedViewTab, setFinishedViewTab] = useState<'ranking' | 'scenarios'>('ranking');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);

  const hostRef = useRef<P2PRoomHost | null>(null);

  // Contagem regressiva sincronizada com o prazo da rodada
  useEffect(() => {
    if ((liveState?.phase === 'classifying' || liveState?.phase === 'justifying') && liveState?.phaseDeadline) {
      const update = () => {
        const remaining = Math.max(0, Math.ceil((liveState.phaseDeadline! - Date.now()) / 1000));
        setCountdown(remaining);
      };
      update();
      const interval = setInterval(update, 500);
      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [liveState?.phase, liveState?.phaseDeadline]);

  // Cronômetro decorrido quando a sala não possui limite de tempo fixo
  useEffect(() => {
    if (liveState?.phase === 'classifying' || liveState?.phase === 'justifying') {
      setElapsedSeconds(0);
      const interval = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [liveState?.currentRoundIndex, liveState?.phase]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateRoom = () => {
    setCreateErrorMsg('');
    try {
      if (hostRef.current) {
        hostRef.current.destroy();
      }

      const host = new P2PRoomHost(
        {
          cardCount: roomCardCount,
          timerDuration: roomTimer,
          goal: roomGoal,
          mode: 'classification',
          scenarioFocus: 'balanced'
        },
        (state) => {
          setLiveState(state);
        },
        (status, errorMsg) => {
          setP2pStatus(status);
          if (errorMsg) {
            setCreateErrorMsg(errorMsg);
          }
        }
      );

      hostRef.current = host;
      setActiveRoomCode(host.roomCode);
      setSelectedScenarioIndex(0);
      setFinishedViewTab('ranking');
      setShowCloseModal(false);
    } catch (e: any) {
      setCreateErrorMsg(e?.message || 'Erro ao inicializar sala P2P.');
    }
  };

  const handleAdvancePhase = (targetPhase?: any) => {
    if (!hostRef.current) return;
    hostRef.current.advancePhase(targetPhase);
  };

  const handleTogglePause = () => {
    if (!hostRef.current) return;
    hostRef.current.togglePause();
  };

  const handleReopenCurrentRound = () => {
    if (!hostRef.current) return;
    hostRef.current.reopenCurrentRound();
  };

  const handleKickParticipant = (nick: string) => {
    if (!hostRef.current) return;
    hostRef.current.kickParticipant(nick);
  };

  // Encerramento da sala confirmado pelo professor no modal (funciona sem window.confirm)
  const handleConfirmCloseRoom = () => {
    if (!hostRef.current) return;
    setIsClosingRoom(true);
    hostRef.current.finishRoom();
    setIsClosingRoom(false);
    setShowCloseModal(false);
  };

  // Iniciar nova sala / Abrir outra sala: reseta o estado imediatamente
  const handleStartNewRoom = () => {
    if (hostRef.current) {
      hostRef.current.destroy();
      hostRef.current = null;
    }
    setActiveRoomCode(null);
    setLiveState(null);
    setSelectedScenarioIndex(0);
    setFinishedViewTab('ranking');
    setShowCloseModal(false);
    setCreateErrorMsg('');
  };


  // Gera a URL dinâmica da sala para o QR Code (compatível automaticamente com GitHub Pages, subpastas ou domínio próprio)
  const getJoinUrl = () => {
    if (typeof window === 'undefined' || !activeRoomCode) return '';
    const origin = window.location.origin;
    const cleanPath = window.location.pathname.replace(/\/index\.html$/i, '/');
    return `${origin}${cleanPath}?room=${activeRoomCode}`;
  };

  useEffect(() => {
    return () => {
      if (hostRef.current) {
        hostRef.current.destroy();
      }
    };
  }, []);

  // Lista de cenários com desempenho detalhado retornados pelo servidor
  const scenariosData = liveState?.scenariosSummary || [];

  const renderScenarioChartsContent = () => {
    if (!scenariosData || scenariosData.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-xs text-stone-500">
          Nenhum dado detalhado por cenário disponível para esta sala ainda.
        </div>
      );
    }

    const sc = scenariosData[selectedScenarioIndex] || scenariosData[0];
    if (!sc) return null;

    const totalAnswers = sc.totalAnswers || 0;
    const esforcoVotes = sc.categoryDistribution?.esforco || 0;
    const dependenciaVotes = sc.categoryDistribution?.dependencia || 0;
    const esforcoPercent = totalAnswers > 0 ? Math.round((esforcoVotes / totalAnswers) * 100) : 0;
    const dependenciaPercent = totalAnswers > 0 ? Math.round((dependenciaVotes / totalAnswers) * 100) : 0;
    const justifications = sc.justifications || [];

    return (
      <div className="space-y-6">
        {/* Seletor de Cenários em Pílulas */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-stone-100">
          {scenariosData.map((sItem: any, idx: number) => {
            const hasVotes = (sItem.totalAnswers || 0) > 0;
            return (
              <button
                key={sItem.cardId || idx}
                type="button"
                onClick={() => setSelectedScenarioIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedScenarioIndex === idx
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>Cenário {idx + 1}</span>
                {hasVotes && (
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedScenarioIndex === idx ? 'bg-[#38B6FF]' : 'bg-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Exibição do Cenário Selecionado */}
        <div className="space-y-6 pt-2">
          {/* Card do Cenário */}
          <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Cenário {selectedScenarioIndex + 1} de {scenariosData.length}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  sc.expectedCategory === 'esforco'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Gabarito: {sc.expectedCategory === 'esforco' ? 'Esforço Cognitivo' : 'Dependência Cognitiva'}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
              "{sc.text || sc.scenarioText}"
            </p>
          </div>

          {/* GRÁFICO 1: DISTRIBUIÇÃO DAS RESPOSTAS DE CLASSIFICAÇÃO */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Gráfico 1: Votos de Classificação da Turma ({totalAnswers} respostas)
            </h4>

            {/* Barra Esforço */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Esforço Cognitivo</span>
                  {sc.expectedCategory === 'esforco' && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                      Gabarito
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-bold">
                  {esforcoVotes} votos ({esforcoPercent}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${esforcoPercent}%` }}
                />
              </div>
            </div>

            {/* Barra Dependência */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span>Dependência Cognitiva</span>
                  {sc.expectedCategory === 'dependencia' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                      Gabarito
                    </span>
                  )}
                </span>
                <span className="tabular-nums font-bold">
                  {dependenciaVotes} votos ({dependenciaPercent}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${dependenciaPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* GRÁFICO 2: DISTRIBUIÇÃO DAS RESPOSTAS DE JUSTIFICATIVAS */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              {sc.hasJustification === false
                ? 'Etapa de Justificativa'
                : 'Gráfico 2: Desempenho e Escolha das Alternativas de Justificativa'}
            </h4>

            {sc.hasJustification === false ? (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                <span className="font-bold text-stone-800">Alternância Pedagógica: </span>
                Esta rodada não possuiu etapa de justificativa. A pontuação máxima da classificação foi de 100 pontos para os estudantes.
              </div>
            ) : (
              <div className="space-y-3">
                {justifications.map((just: any, jIdx: number) => {
                  const votes = just.votes || 0;
                  const percent = just.percent || 0;
                  return (
                    <div
                      key={just.id || jIdx}
                      className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                        just.isExpected
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded bg-stone-200 text-stone-800 font-bold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + jIdx)}
                          </span>
                          <span className="font-medium text-stone-900 leading-snug">
                            {just.text}
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          {just.isExpected ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                              <Check className="w-3 h-3" />
                              <span>Esperada</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                              Distrator
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Barra de Votos para esta Justificativa */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] text-stone-600">
                          <span>Votos da Turma:</span>
                          <span className="font-bold tabular-nums">
                            {votes} votos ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              just.isExpected ? 'bg-emerald-600' : 'bg-stone-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Explicação Pedagógica da Alternativa */}
                      {just.explanation && (
                        <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100/80">
                          <strong>Motivo Pedagógico:</strong> {just.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Caixa de Feedback Síntese Pedagógica */}
          {sc.shortExplanation && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
              <div className="font-bold text-stone-900">
                Síntese Didática do Cenário:
              </div>
              <p>{sc.shortExplanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Modal In-App para Confirmação de Encerramento de Sala */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-stone-900">
                Encerrar Sala ao Vivo?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                A atividade será concluída agora e o relatório com o ranking final dos estudantes e desempenho por cenário será disponibilizado imediatamente.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                disabled={isClosingRoom}
                className="flex-1 py-3 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseRoom}
                disabled={isClosingRoom}
                className="flex-1 py-3 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {isClosingRoom ? 'Encerrando...' : 'Sim, Encerrar'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Topo do Painel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#38B6FF]" />
            <span className="text-[#38B6FF] font-bold">Ambiente Pedagógico do Educador</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Painel de Condução e Análise Coletiva</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeRoomCode && (
            <>
              {liveState?.phase !== 'finished' ? (
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
                >
                  Encerrar Sala
                </button>
              ) : (
                <button
                  onClick={handleStartNewRoom}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Iniciar Nova Sala</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={onBack}
            className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DO PROFESSOR */}
      <div>
        {!activeRoomCode ? (
          /* ========================================================================= */
          /* FORMULÁRIO DE CRIAÇÃO DE NOVA SALA                                        */
          /* ========================================================================= */
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center p-2 text-white border border-stone-800">
                <Sliders className="w-5 h-5 text-[#38B6FF]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Configurar e Abrir Nova Sala
                </h2>
                <p className="text-xs text-stone-500">
                  Configure a dinâmica e gere um código seguro para a sua turma participar.
                </p>
              </div>
            </div>

            {createErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {createErrorMsg}
              </div>
            )}

            <div className="space-y-6">
              {/* 1. Quantidade de Cenários */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  1. Quantidade de Cenários na Rodada:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { count: 4, label: '4 Cenários', sub: 'Aquecimento rápido' },
                    { count: 8, label: '8 Cenários', sub: 'Padrão recomendado' },
                    { count: 12, label: '12 Cenários', sub: 'Dinâmica aprofundada' },
                    { count: 16, label: '16 Cenários', sub: 'Banco completo' }
                  ].map(opt => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => setRoomCardCount(opt.count)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        roomCardCount === opt.count
                          ? 'border-[#0284c7] bg-sky-50/80 font-bold text-sky-950 ring-2 ring-[#0284c7]/20 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Cronômetro por Etapa */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  2. Cronômetro por Etapa (Classificação & Justificativa):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { sec: 0, label: 'Livre', sub: 'Sem limite' },
                    { sec: 15, label: '15s', sub: 'Dinâmico' },
                    { sec: 30, label: '30s', sub: 'Equilibrado' },
                    { sec: 45, label: '45s', sub: 'Reflexivo' },
                    { sec: 60, label: '60s', sub: 'Aprofundado' }
                  ].map(t => (
                    <button
                      key={t.sec}
                      type="button"
                      onClick={() => setRoomTimer(t.sec)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        roomTimer === t.sec
                          ? 'border-[#FDB813] bg-amber-50/80 font-bold text-amber-950 ring-2 ring-[#FDB813]/30 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-stone-500">{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Meta Coletiva da Turma */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-stone-500" />
                    <span>3. Meta Formativa Coletiva da Sala:</span>
                  </label>
                  <span className="text-xs font-extrabold font-mono text-[#0284c7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    {roomGoal}% de acerto
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={roomGoal}
                  onChange={(e) => setRoomGoal(Number(e.target.value))}
                  className="w-full accent-[#0284c7]"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>50% (Iniciante)</span>
                  <span>75% (Equilibrado)</span>
                  <span>100% (Excelência Crítica)</span>
                </div>
              </div>

              {/* Botão de Criação */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Monitor className="w-4 h-4 text-[#38B6FF]" />
                  <span>Criar Sala</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ) : liveState?.phase === 'lobby' ? (
          /* ========================================================================= */
          /* SALA CRIADA: EXIBIÇÃO DO CÓDIGO DE ACESSO PARA OS ALUNOS                  */
          /* ========================================================================= */
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Bloco Projetor Principal */}
            <div className="bg-stone-950 text-white rounded-3xl p-6 sm:p-10 text-center shadow-2xl border border-stone-800 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#38B6FF]/10 blur-3xl pointer-events-none rounded-full" />

              <div className="space-y-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Conecte-se pelo QR Code ou Digite o Código
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto">
                  Aponte a câmera do celular para o QR Code ou acesse pelo computador com o código da sala:
                </p>
              </div>

              {/* QR Code e Código de Acesso Lado a Lado */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4 p-4 bg-stone-900/60 rounded-3xl border border-stone-800 max-w-2xl mx-auto">
                {/* QR Code SVG */}
                <div className="p-3 bg-white rounded-2xl shadow-lg shrink-0">
                  <QRCodeSVG
                    value={getJoinUrl()}
                    size={140}
                    level="M"
                    includeMargin={false}
                  />
                  <div className="text-[10px] text-stone-700 font-bold mt-1 text-center">
                    Escanear p/ Entrar
                  </div>
                </div>

                {/* Código Gigante para Projeção no Telão */}
                <div className="text-center sm:text-left space-y-3">
                  <div className="text-xs uppercase tracking-wider text-stone-400 font-bold">
                    Código PIN da Sala:
                  </div>
                  <div className="bg-stone-950 border-2 border-stone-700 rounded-2xl px-6 py-3 shadow-inner hover:border-[#38B6FF]/50 transition-colors inline-block">
                    <span className="text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-widest text-white select-all">
                      {activeRoomCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Passos rápidos de entrada */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto text-left">
                <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
                  <div className="text-[11px] font-bold text-[#38B6FF] uppercase">1. Conectar</div>
                  <div className="text-xs text-stone-300 mt-1">Abra o site ou aponte a câmera para o QR Code.</div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
                  <div className="text-[11px] font-bold text-[#38B6FF] uppercase">2. Código / Nome</div>
                  <div className="text-xs text-stone-300 mt-1">Confirme o código <strong className="text-white">{activeRoomCode}</strong> e digite seu nome.</div>
                </div>
                <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
                  <div className="text-[11px] font-bold text-[#38B6FF] uppercase">3. Interação ao Vivo</div>
                  <div className="text-xs text-stone-300 mt-1">Conexão direta em tempo real para a turma.</div>
                </div>
              </div>
            </div>

            {/* Participantes Conectados e Botão de Iniciar Primeira Rodada */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-base font-bold text-stone-900">
                        Estudantes Conectados: {liveState?.participantsCount || 0}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500">
                      {liveState?.participantsCount && liveState.participantsCount > 0
                        ? 'Estudantes conectados prontos para a atividade.'
                        : 'Aguardando os estudantes digitarem o código de acesso...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleAdvancePhase('classifying')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    <span>Iniciar Primeira Rodada</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lista dos Estudantes */}
              {liveState?.participants && liveState.participants.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {liveState.participants.map((p: any) => (
                    <div
                      key={p.nickname}
                      className="flex items-center gap-2 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-bold text-stone-800">{p.nickname}</span>
                      <button
                        type="button"
                        onClick={() => handleKickParticipant(p.nickname)}
                        className="text-stone-400 hover:text-red-600 p-0.5 cursor-pointer ml-1"
                        title="Remover estudante da sala"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl">
                  Nenhum estudante conectado ainda. Os nomes aparecerão aqui conforme entrarem com o código {activeRoomCode}.
                </div>
              )}
            </div>
          </div>
        ) : liveState?.phase === 'finished' ? (
          /* ========================================================================= */
          /* TELA DE ATIVIDADE FINALIZADA: RANKING E DESEMPENHO POR CENÁRIO COM GRÁFICOS */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Header de Atividade Finalizada */}
            <div className="bg-black text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#FDB813] font-semibold">
                  <Trophy className="w-4 h-4" />
                  <span>Atividade Concluída · Sala {activeRoomCode}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Resultados Finais da Turma
                </h2>
                <p className="text-xs text-stone-300">
                  {liveState?.participantsCount || 0} estudantes participaram desta dinâmica ({liveState?.totalRounds || 0} cenários avaliados).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartNewRoom}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-2xl transition-colors shadow-xs cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Abrir Outra Sala</span>
                </button>
              </div>
            </div>

            {/* Alternância entre Ranking e Desempenho por Cenário com Gráficos */}
            <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
              <button
                type="button"
                onClick={() => setFinishedViewTab('ranking')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  finishedViewTab === 'ranking'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Trophy className="w-4 h-4 text-[#FDB813]" />
                <span>Ranking Geral dos Estudantes</span>
              </button>

              <button
                type="button"
                onClick={() => setFinishedViewTab('scenarios')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  finishedViewTab === 'scenarios'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-[#38B6FF]" />
                <span>Desempenho por Cenário</span>
              </button>
            </div>

            {/* ABA 1: RANKING DOS ESTUDANTES */}
            {finishedViewTab === 'ranking' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Classificação Final dos Estudantes
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pontuação ponderada acumulada nas rodadas com alternância pedagógica.
                  </p>
                </div>

                {liveState?.ranking && liveState.ranking.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-3">Pos.</th>
                          <th className="py-3 px-3">Nome do Estudante</th>
                          <th className="py-3 px-3 text-center">Classificações</th>
                          <th className="py-3 px-3 text-center">Justificativas</th>
                          <th className="py-3 px-3 text-right">Pontuação Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                        {liveState.ranking.map((row: any, idx: number) => (
                          <tr key={row.nickname} className={idx < 3 ? 'bg-amber-50/30' : ''}>
                            <td className="py-3.5 px-3">
                              {idx === 0 && <span className="text-amber-500 font-bold">🥇 1º</span>}
                              {idx === 1 && <span className="text-stone-400 font-bold">🥈 2º</span>}
                              {idx === 2 && <span className="text-amber-700 font-bold">🥉 3º</span>}
                              {idx > 2 && <span className="font-mono text-stone-500">{idx + 1}º</span>}
                            </td>
                            <td className="py-3.5 px-3 font-bold text-stone-900">
                              {row.nickname}
                            </td>
                            <td className="py-3.5 px-3 text-center tabular-nums">
                              {row.correctCategoriesCount}/{row.totalAnswers} ({row.categoryPoints} pts)
                            </td>
                            <td className="py-3.5 px-3 text-center tabular-nums">
                              {row.correctJustificationsCount}/{row.totalAnswers} ({row.justificationPoints} pts)
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-sm tabular-nums text-stone-900">
                              {row.totalScore} pts
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-stone-400">
                    Nenhum voto computado para gerar ranking.
                  </div>
                )}
              </div>
            )}

            {/* ABA 2: DESEMPENHO POR CENÁRIO COM GRÁFICOS */}
            {finishedViewTab === 'scenarios' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Desempenho da Turma por Cenário Pedagógico
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Selecione um cenário para ver a distribuição detalhada de votos e a análise das alternativas com gráficos.
                  </p>
                </div>

                {renderScenarioChartsContent()}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* CONSOLE ATIVO DO PROFESSOR (RODADAS AO VIVO COM CONTROLE DIRETO)           */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Faixa Superior com Código Grande e Contadores */}
            <div className="bg-black text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-stone-800">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#38B6FF] font-semibold mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#38B6FF] animate-ping" />
                  <span>Código de Acesso para os Alunos Entrarem</span>
                </div>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-widest text-white">
                  {activeRoomCode}
                </div>
                <div className="text-xs text-stone-400 mt-2">
                  Acesse o Radar Cognitivo e digite este código na opção "Entrar como Aluno".
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Contador de Tempo do Professor */}
                <div className="bg-stone-900 border border-stone-800 px-4 py-2.5 rounded-xl text-center min-w-[100px]">
                  <div className="text-[10px] text-stone-400 uppercase flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-[#FDB813]" />
                    <span>Tempo</span>
                  </div>
                  <div className={`text-2xl font-bold font-mono tabular-nums ${
                    countdown !== null && countdown <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
                  }`}>
                    {countdown !== null 
                      ? `${countdown}s` 
                      : (liveState?.phase === 'classifying' || liveState?.phase === 'justifying') 
                        ? formatElapsed(elapsedSeconds) 
                        : '--'}
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 px-4 py-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-stone-400 uppercase">Conectados</div>
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {liveState?.participantsCount || 0}
                  </div>
                </div>

                <div className="bg-stone-900 border border-stone-800 px-4 py-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-stone-400 uppercase">Rodada</div>
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {liveState ? `${liveState.currentRoundIndex + 1}/${liveState.totalRounds}` : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Controle de Fase da Rodada */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 uppercase">Fase Atual:</span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-sky-50 text-sky-800 rounded-lg border border-sky-200">
                    {liveState?.phase === 'classifying' && (
                      liveState?.hasJustification
                        ? '1. Votação de Classificação'
                        : '1. Votação de Classificação (sem justificativa nesta rodada)'
                    )}
                    {liveState?.phase === 'justifying' && '2. Escolha de Justificativas'}
                    {liveState?.phase === 'revealing' && '3. Revelação de Resultados'}
                  </span>

                  {/* Badge de Tempo Adicional na Barra de Controle */}
                  {(liveState?.phase === 'classifying' || liveState?.phase === 'justifying') && (
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                      countdown !== null && countdown <= 5
                        ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}>
                      ⏱️ {countdown !== null ? `${countdown}s restantes` : `Tempo: ${formatElapsed(elapsedSeconds)}`}
                    </span>
                  )}

                  {liveState?.isPaused && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded">
                      Pausada
                    </span>
                  )}
                </div>

                {/* Controles de Condução */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className="px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                  >
                    {liveState?.isPaused ? 'Despausar' : 'Pausar'}
                  </button>

                  <button
                    type="button"
                    onClick={handleReopenCurrentRound}
                    title="Reabrir votação do cenário atual"
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reabrir</span>
                  </button>

                  {(() => {
                    const isLastRound = (liveState?.currentRoundIndex ?? 0) + 1 >= (liveState?.totalRounds ?? 0);
                    const isFinalAction = 
                      (liveState?.phase === 'classifying' && !liveState?.hasJustification && isLastRound) ||
                      (liveState?.phase === 'justifying' && isLastRound) ||
                      (liveState?.phase === 'revealing' && isLastRound);

                    let buttonText = 'Avançar';
                    if (liveState?.phase === 'classifying') {
                      buttonText = liveState?.hasJustification
                        ? 'Avançar para Justificativas'
                        : (isLastRound ? 'Finalizar Rodadas & Ver Resultados' : 'Revelar Resultados');
                    } else if (liveState?.phase === 'justifying') {
                      buttonText = isLastRound
                        ? 'Finalizar Rodadas & Ver Resultados'
                        : 'Revelar Resultados';
                    } else if (liveState?.phase === 'revealing') {
                      buttonText = isLastRound
                        ? 'Finalizar Rodadas & Ver Resultados'
                        : 'Próximo Cenário';
                    }

                    return (
                      <button
                        type="button"
                        onClick={() => handleAdvancePhase()}
                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${
                          isFinalAction
                            ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/30'
                            : 'bg-[#0284c7] hover:bg-[#0369a1]'
                        }`}
                      >
                        {isFinalAction && <Trophy className="w-3.5 h-3.5 text-amber-300" />}
                        <span>{buttonText}</span>
                        {!isFinalAction && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Exibição do Cenário Atual da Rodada (SEM GABARITO NA TELA AO VIVO) */}
              {liveState?.currentCard && (
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Cenário em Análise ({liveState.currentRoundIndex + 1} de {liveState.totalRounds})
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                    "{liveState.currentCard.text}"
                  </p>
                </div>
              )}

              {/* Gráficos de Distribuição de Votos durante a Revelação */}
              {liveState?.aggregatedResults && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>Distribuição de Votos da Turma ({liveState.aggregatedResults.submittedCount} respostas recebidas):</span>
                  </div>

                  {/* Barra Esforço */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span>Esforço Cognitivo</span>
                      </span>
                      <span className="tabular-nums font-bold">
                        {liveState.aggregatedResults.categoryDistribution.esforco || 0} votos (
                        {liveState.aggregatedResults.submittedCount > 0
                          ? Math.round(
                              ((liveState.aggregatedResults.categoryDistribution.esforco || 0) /
                                liveState.aggregatedResults.submittedCount) *
                                100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            liveState.aggregatedResults.submittedCount > 0
                              ? ((liveState.aggregatedResults.categoryDistribution.esforco || 0) /
                                  liveState.aggregatedResults.submittedCount) *
                                100
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Barra Dependência */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                        <span>Dependência Cognitiva</span>
                      </span>
                      <span className="tabular-nums font-bold">
                        {liveState.aggregatedResults.categoryDistribution.dependencia || 0} votos (
                        {liveState.aggregatedResults.submittedCount > 0
                          ? Math.round(
                              ((liveState.aggregatedResults.categoryDistribution.dependencia || 0) /
                                liveState.aggregatedResults.submittedCount) *
                                100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            liveState.aggregatedResults.submittedCount > 0
                              ? ((liveState.aggregatedResults.categoryDistribution.dependencia || 0) /
                                  liveState.aggregatedResults.submittedCount) *
                                100
                              : 0
                          }%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Painel de Participação Formativa da Turma */}
                  <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-sky-950">Engajamento da Sala:</div>
                      <div className="text-sky-800">
                        {liveState.aggregatedResults.submittedCount} participantes votaram nesta rodada.
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg font-bold bg-sky-100 text-sky-800">
                      Votos Computados
                    </span>
                  </div>

                  {/* Ranking da Turma ate o Momento para o Professor */}
                  {liveState.ranking && liveState.ranking.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                              Ranking da Turma até o Momento
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              Classificação parcial acumulada até o Cenário {liveState.currentRoundIndex + 1} de {liveState.totalRounds}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg border border-stone-200">
                          {liveState.ranking.length} {liveState.ranking.length === 1 ? "estudante" : "estudantes"}
                        </span>
                      </div>

                      <div className="border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="p-2.5 w-16">Posição</th>
                              <th className="p-2.5">Nome do Estudante</th>
                              <th className="p-2.5 text-right">Classificações</th>
                              <th className="p-2.5 text-right">Justificativas</th>
                              <th className="p-2.5 text-right">Pontos</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {liveState.ranking.map((item: any, idx: number) => (
                              <tr key={`${item.nickname}-${item.rank}-${idx}`} className="hover:bg-stone-50 transition-colors">
                                <td className="p-2.5 font-mono font-bold">
                                  {item.rank === 1 ? "🥇 1º" : item.rank === 2 ? "🥈 2º" : item.rank === 3 ? "🥉 3º" : `${item.rank}º`}
                                </td>
                                <td className="p-2.5 font-semibold text-stone-900">
                                  {item.nickname}
                                </td>
                                <td className="p-2.5 text-right tabular-nums text-stone-600">
                                  {item.correctCategoriesCount}/{item.totalAnswers ?? (liveState.currentRoundIndex + 1)}
                                </td>
                                <td className="p-2.5 text-right tabular-nums text-stone-600">
                                  {item.correctJustificationsCount}/{item.totalAnswers ?? (liveState.currentRoundIndex + 1)}
                                </td>
                                <td className="p-2.5 text-right tabular-nums text-[#0284c7] font-bold text-sm">
                                  {item.totalScore} pts
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista de Participantes Conectados no Lobby */}
            {liveState?.participants && (
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Estudantes Conectados ({liveState.participants.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {liveState.participants.map((p: any) => (
                    <div
                      key={p.nickname}
                      className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-stone-800">{p.nickname}</span>
                      <button
                        type="button"
                        onClick={() => handleKickParticipant(p.nickname)}
                        className="text-stone-400 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Remover da sala"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
