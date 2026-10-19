/**
 * Radar Cognitivo - Barra de Navegação Superior com Identidade Alura Start
 */

import React from 'react';
import { Users, Shield } from 'lucide-react';
import { StartLogo } from './StartLogo';

export type ActiveTab = 'home' | 'student' | 'teacher';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
      {/* Faixa Superior com as 5 Cores da Identidade Visual Start */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-[#FF5A36]" />
        <div className="h-full flex-1 bg-[#FDB813]" />
        <div className="h-full flex-1 bg-[#38B6FF]" />
        <div className="h-full flex-1 bg-[#B862F2]" />
        <div className="h-full flex-1 bg-[#4ADE80]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Marca do Radar Cognitivo com Logo Start */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF] rounded-lg py-1 px-1"
          >
            <div className="px-2.5 py-1 rounded-lg bg-[#fbfbfa] flex items-center justify-center shrink-0 border border-[#fbfbfa]">
              <StartLogo size="sm" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-stone-900 whitespace-nowrap leading-none">
              Radar Cognitivo
            </span>
          </button>

          {/* Zone 2: Links de navegação em uma única linha */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600" aria-label="Navegação Principal">
            <button
              onClick={() => onSelectTab('home')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                activeTab === 'home' ? 'text-stone-900 font-bold border-b-2 border-[#38B6FF]' : ''
              }`}
            >
              Início
            </button>
            <button
              onClick={() => onSelectTab('student')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'student' ? 'text-sky-700 font-bold border-b-2 border-[#38B6FF]' : ''
              }`}
            >
              <Users className="w-4 h-4 text-[#38B6FF]" />
              <span>Entrar como Aluno</span>
            </button>
            <button
              onClick={() => onSelectTab('teacher')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                activeTab === 'teacher' ? 'text-purple-700 font-bold border-b-2 border-[#B862F2]' : ''
              }`}
            >
              <Shield className="w-4 h-4 text-[#B862F2]" />
              <span>Área do Professor</span>
            </button>
          </nav>

          {/* Zone 3: Ação primária / Acesso Alternado */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab(activeTab === 'teacher' ? 'student' : 'teacher')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38B6FF] bg-stone-900 text-white hover:bg-stone-800 shadow-xs"
            >
              {activeTab === 'teacher' ? (
                <>
                  <Users className="w-3.5 h-3.5 text-[#38B6FF]" aria-hidden="true" />
                  <span>Visão do Aluno</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-[#FDB813]" aria-hidden="true" />
                  <span>Área do Professor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
