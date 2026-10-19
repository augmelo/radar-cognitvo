/**
 * Radar Cognitivo - Aplicação Web Full-Stack para Salas de Aula
 * 
 * Focada exclusivamente nas duas experiências colaborativas:
 * 1. Versão Aluno: Entrada com código de sala, nome do estudante e respostas ao vivo.
 * 2. Versão do Professor: Abertura de sala, condução de rodadas e análise agregada.
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { TutorialModal } from './components/TutorialModal';
import { StudentLiveRoom } from './components/StudentLiveRoom';
import { TeacherDashboard } from './components/TeacherDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [quickRoomCode, setQuickRoomCode] = useState('');

  // Detecta parâmetro de sala na URL (?room=RAD742 ou #room=RAD742) para abertura direta via QR Code
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let code = searchParams.get('room');
      if (!code && window.location.hash) {
        const hashMatch = window.location.hash.match(/room=([A-Za-z0-9]+)/i);
        if (hashMatch) code = hashMatch[1];
      }
      if (code) {
        const clean = code.trim().toUpperCase();
        setQuickRoomCode(clean);
        setActiveTab('student');
      }
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Barra de Navegação */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onQuickJoinRoom={(code) => {
              setQuickRoomCode(code);
              setActiveTab('student');
            }}
          />
        )}

        {/* VERSÃO DO ALUNO NA SALA AO VIVO */}
        {activeTab === 'student' && (
          <StudentLiveRoom
            initialRoomCode={quickRoomCode}
            onExit={() => {
              setQuickRoomCode('');
              setActiveTab('home');
            }}
          />
        )}

        {/* ÁREA DO EDUCADOR / PROFESSOR */}
        {activeTab === 'teacher' && (
          <TeacherDashboard onBack={() => setActiveTab('home')} />
        )}
      </main>

      {/* Modal de Tutorial */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
