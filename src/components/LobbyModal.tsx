// 📁 src/components/LobbyModal.tsx

import React, { useState, useEffect } from 'react';
import { GameMode } from '../types/game';
import { useI18n } from '../i18n/I18nContext';
import { Crown, Play, BookOpen } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { RulesModal } from './RulesModal';

interface LobbyModalProps {
  onCreateGame: (playerName: string, mode: GameMode) => Promise<void>;
  onJoinGame: (roomCode: string, playerName: string) => Promise<boolean>;
  isLoading: boolean;
  errorMessage: string | null;
}

const PLAYER_NAME_STORAGE_KEY = 'killthefacecards_player_name';

export const LobbyModal: React.FC<LobbyModalProps> = ({
  onCreateGame,
  onJoinGame,
  isLoading,
  errorMessage,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'SOLO' | 'CREATE' | 'JOIN'>('SOLO');
  const [playerName, setPlayerName] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Restore previously saved player name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const savePlayerName = (name: string) => {
    if (name.trim()) {
      localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'SOLO') {
      const finalName = playerName || t('defaultSoloName');
      savePlayerName(finalName);
      await onCreateGame(finalName, 'SOLO');
    } else if (activeTab === 'CREATE') {
      const finalName = playerName || t('defaultHostName');
      savePlayerName(finalName);
      await onCreateGame(finalName, 'MULTIPLAYER');
    } else if (activeTab === 'JOIN') {
      if (roomCode.trim().length === 4) {
        const finalName = playerName || t('defaultJoinName');
        savePlayerName(finalName);
        await onJoinGame(roomCode, finalName);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="w-full max-w-md rounded-3xl border-2 border-amber-600/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-2xl shadow-amber-950/40 flex flex-col gap-6 text-slate-100 relative">
          {/* Top Bar inside Lobby Modal with Language Toggle */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown size={28} />
            </div>
            <LanguageToggle />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black font-cinzel text-amber-400 tracking-wider">
              {t('appTitle')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('appSubtitle')}
            </p>
          </div>

          {/* 3 Game Mode Tabs: Solo, Create, Join */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('SOLO')}
              className={`py-2 rounded-xl transition-all ${
                activeTab === 'SOLO'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('solo')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CREATE')}
              className={`py-2 rounded-xl transition-all ${
                activeTab === 'CREATE'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('create')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('JOIN')}
              className={`py-2 rounded-xl transition-all ${
                activeTab === 'JOIN'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('join')}
            </button>
          </div>

          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold px-4 py-2.5 rounded-xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('playerName')}
              </label>
              <input
                type="text"
                placeholder={t('playerPlaceholder')}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-medium"
                maxLength={20}
              />
            </div>

            {activeTab === 'JOIN' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('roomCode')}
                </label>
                <input
                  type="text"
                  placeholder={t('roomCodePlaceholder')}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-amber-400 font-cinzel font-black uppercase tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  maxLength={4}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (activeTab === 'JOIN' && roomCode.trim().length !== 4)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black font-cinzel text-base py-3.5 rounded-xl shadow-xl shadow-amber-950/50 transition-all uppercase tracking-wider mt-2"
            >
              <Play size={20} className="fill-slate-950" />
              <span>
                {isLoading
                  ? t('connecting')
                  : activeTab === 'SOLO'
                  ? t('startSolo')
                  : activeTab === 'CREATE'
                  ? t('createRoom')
                  : t('joinRoom')}
              </span>
            </button>
          </form>

          {/* Official Rulebook Guide Button on Home Page */}
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 text-amber-300 border border-amber-500/30 rounded-xl py-2.5 text-xs font-bold transition-all shadow-md"
          >
            <BookOpen size={16} />
            <span>{t('rulesTitle')}</span>
          </button>

          <div className="text-[11px] text-slate-500 text-center space-y-1 border-t border-slate-900 pt-4">
            <p>{t('handLimitsInfo')}</p>
          </div>
        </div>
      </div>

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </>
  );
};
