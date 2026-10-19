/**
 * Radar Cognitivo - Tela Inicial com Identidade Visual Alura Start
 * Focada nas duas experiências centrais: Aluno na Sala ao Vivo e Área do Professor.
 */

import React, { useState } from 'react';
import { Users, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { ActiveTab } from './Navbar';
import { StartLogo } from './StartLogo';

interface HomeScreenProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenTutorial: () => void;
  onQuickJoinRoom: (code: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenTutorial,
  onQuickJoinRoom
}) => {
  const [quickCode, setQuickCode] = useState('');

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      onQuickJoinRoom(quickCode.trim().toUpperCase());
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
            Quem raciocina, verifica e decide quando usamos tecnologia?
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
            O <strong>Radar Cognitivo</strong> é uma ferramenta pedagógica interativa para salas de aula.
            Estudantes e professores analisam cenários reais do uso de inteligência artificial e tecnologia,
            distinguindo entre <strong>esforço cognitivo</strong> e <strong>dependência cognitiva</strong> em tempo real,
            com justificativas reflexivas e foco na aprendizagem coletiva.
          </p>

          {/* Duas Portas de Entrada */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('student')}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-xl transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF] focus-visible:ring-offset-2"
            >
              <Users className="w-4 h-4" />
              <span>Entrar como Aluno</span>
            </button>

            <button
              onClick={() => onNavigate('teacher')}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
            >
              <Shield className="w-4 h-4 text-[#FDB813]" />
              <span>Área do Professor</span>
            </button>

            <button
              onClick={onOpenTutorial}
              className="inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF]"
            >
              <HelpCircle className="w-4 h-4 text-stone-400" />
              <span>Como Funciona a Dinâmica</span>
            </button>
          </div>

          {/* Entrada Direta por Código de Sala */}
          <form onSubmit={handleJoinSubmit} className="pt-4 max-w-md">
            <label htmlFor="quick-code-input" className="block text-xs font-semibold text-stone-700 mb-1.5">
              Já tem o código da sala de aula?
            </label>
            <div className="flex items-center gap-2">
              <input
                id="quick-code-input"
                type="text"
                placeholder="Ex: RAD742"
                maxLength={8}
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 text-sm font-mono tracking-widest uppercase bg-white border border-stone-300 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF] font-bold text-stone-900"
              />
              <button
                type="submit"
                disabled={!quickCode.trim()}
                className="px-5 py-2.5 text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF]"
              >
                Entrar na Sala
              </button>
            </div>
            <span className="text-[11px] text-stone-400 mt-1.5 block">
              Alunos não precisam de cadastro ou e-mail. Apenas o código da sala e o nome do estudante.
            </span>
          </form>
        </div>

        {/* Hero Visual: Substituído pelo Logo Start Alura com Design Sofisticado */}
        <div className="lg:col-span-5">
          <StartLogo
            variant="dark-card"
            className="w-full aspect-16/10 lg:aspect-4/3"
          />
        </div>
      </div>

      {/* Grid com as duas experiências */}
      <div className="pt-8 border-t border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Box Aluno */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between hover:border-sky-300 transition-all hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] flex items-center justify-center mb-4 border border-sky-100">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">
                Versão do Estudante
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Participe das rodadas da sua turma diretamente no celular ou computador:
              </p>
              <ul className="space-y-2 text-xs text-stone-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-[#38B6FF] font-bold">•</span>
                  <span><strong>Acesso Rápido:</strong> Digite o nome do estudante e entre com o código da sala sem necessidade de senha ou cadastro.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#38B6FF] font-bold">•</span>
                  <span><strong>Votação em Duas Etapas:</strong> Primeiro classifique entre esforço ou dependência; em seguida, escolha a justificativa fundamentada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#38B6FF] font-bold">•</span>
                  <span><strong>Reflexão Coletiva:</strong> Acompanhe a distribuição da turma em gráficos formativos sem exposição de erros individuais.</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('student')}
              className="inline-flex items-center justify-between text-xs font-bold text-[#0284c7] hover:text-[#0369a1] pt-4 border-t border-stone-100"
            >
              <span>Acessar Entrada do Aluno</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Box Professor */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all hover:shadow-md">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#B862F2] flex items-center justify-center mb-4 border border-purple-100">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">
                Área do Professor
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Configure salas customizadas e conduza a reflexão em tempo real:
              </p>
              <ul className="space-y-2 text-xs text-stone-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-[#B862F2] font-bold">•</span>
                  <span><strong>Customização Completa:</strong> Escolha quantidade de cenários, tempo de cronômetro, foco pedagógico e reviravoltas (Plot Twist).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B862F2] font-bold">•</span>
                  <span><strong>Condução da Dinâmica:</strong> Avance etapas com segurança, pause quando necessário e gerencie os participantes ao vivo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B862F2] font-bold">•</span>
                  <span><strong>Relatório e Gráficos:</strong> Veja o ranking da turma e analise os gráficos de distribuição por cenário após o encerramento.</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('teacher')}
              className="inline-flex items-center justify-between text-xs font-bold text-purple-700 hover:text-purple-900 pt-4 border-t border-stone-100"
            >
              <span>Acessar Painel do Educador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
