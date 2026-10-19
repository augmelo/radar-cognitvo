/**
 * Radar Cognitivo - Tutorial da Dinâmica em Sala de Aula (3 Passos)
 */

import React, { useState } from 'react';
import { X, Brain, Users, BarChart3, ArrowRight, Check } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <span>Passo {currentStep} de 3</span>
            <span aria-hidden="true">·</span>
            <span>Dinâmica da Turma</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            aria-label="Fechar tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo dos 3 Passos */}
        <div className="py-6 min-h-[220px]">
          {currentStep === 1 && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h2 id="tutorial-title" className="text-xl font-bold text-stone-900 mb-2">
                1. Quem raciocina, verifica e decide?
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                O uso de tecnologia ou inteligência artificial não é automaticamente ruim nem bom.
                O foco da análise é a ação descrita: <strong>quem liderou o esforço intelectual?</strong>
              </p>
              <div className="space-y-2 text-xs text-stone-700">
                <div className="flex items-start gap-2 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                  <span className="font-semibold text-blue-900 whitespace-nowrap">Esforço cognitivo:</span>
                  <span>O estudante mantém a autoria, elabora as hipóteses, checa os fatos e decide ativamente.</span>
                </div>
                <div className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                  <span className="font-semibold text-amber-900 whitespace-nowrap">Dependência cognitiva:</span>
                  <span>O estudante transfere a elaboração ou o julgamento para a ferramenta sem crivo crítico.</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h2 id="tutorial-title" className="text-xl font-bold text-stone-900 mb-2">
                2. Entrada Rápida e Sem Cadastro
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                Em sala de aula, a interação é direta e acolhedora:
              </p>
              <ol className="space-y-2.5 text-xs text-stone-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-700">1.</span>
                  <span><strong>Código de Sala:</strong> O professor projeta o código de 6 caracteres na lousa (ex: RAD742).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-700">2.</span>
                  <span><strong>Nome do Estudante:</strong> Cada aluno informa seu nome para participar, sem necessidade de e-mail ou senha pessoal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-700">3.</span>
                  <span><strong>Sincronização ao Vivo:</strong> A tela avança automaticamente conforme o professor comanda a rodada.</span>
                </li>
              </ol>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h2 id="tutorial-title" className="text-xl font-bold text-stone-900 mb-2">
                3. Revelação Agregada e Debate Formativo
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                Priorizamos a reflexão coletiva sobre rankings ou notas individuais:
              </p>
              <div className="space-y-2 text-xs text-stone-700">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <strong>Sem Exposição:</strong> As respostas individuais nunca são exibidas publicamente na turma.
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <strong>Gráficos Agregados:</strong> O projetor mostra a porcentagem e contagem de votos da sala inteira.
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <strong>Meta Coletiva:</strong> A turma trabalha junta para atingir a meta formativa estabelecida pelo professor.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com botões */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Pular Tutorial
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(s => s - 1)}
                className="px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                Voltar
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(s => s + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <span>Próximo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Entendi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
