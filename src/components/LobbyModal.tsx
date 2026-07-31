// 📁 src/components/LobbyModal.tsx

import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { GameState } from '../types/game';
import { loadSavedSoloGame } from '../utils/saveGame';
import { User, Swords, Crown, Ban, PlayCircle } from 'lucide-react';

interface LobbyModalProps {
  onCreateGame: (playerName: string, mode: 'SOLO' | 'MULTIPLAYER') => void;
  onJoinGame?: (playerName: string, roomId: string) => void;
  onResumeGame: (savedState: GameState) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const PLAYER_NAME_COOKIE = 'killthefacecards_player_name';

export const LobbyModal: React.FC<LobbyModalProps> = ({
  onCreateGame,
  onResumeGame,
  isLoading = false,
  errorMessage = null,
}) => {
  const { t } = useI18n();
  const [gameMode, setGameMode] = useState<'SOLO' | 'MULTIPLAYER'>('SOLO');
  const [savedGame, setSavedGame] = useState<GameState | null>(null);

  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem(PLAYER_NAME_COOKIE) || '';
  });

  useEffect(() => {
    if (playerName) {
      localStorage.setItem(PLAYER_NAME_COOKIE, playerName);
    }
  }, [playerName]);

  // Detect saved solo game whenever player name changes
  useEffect(() => {
    const targetName = playerName.trim() || t('defaultSoloName');
    const loaded = loadSavedSoloGame(targetName);
    setSavedGame(loaded);
  }, [playerName, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameMode === 'SOLO') {
      const finalName = playerName.trim() || t('defaultSoloName');
      localStorage.setItem(PLAYER_NAME_COOKIE, finalName);
      onCreateGame(finalName, 'SOLO');
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <Crown size={32} />
        </div>
        <h1 className="text-2xl font-black font-cinzel text-amber-400 tracking-wider">
          {t('appTitle')}
        </h1>
        <p className="text-xs text-slate-400 max-w-xs">{t('appSubtitle')}</p>
      </div>

      {errorMessage && (
        <div className="mb-4 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl text-center shadow animate-shake">
          {t(errorMessage as any) || errorMessage}
        </div>
      )}

      {/* Resume Saved Game Banner if available */}
      {savedGame && savedGame.currentEnemy && (
        <div className="mb-5 bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-500/40 p-3.5 rounded-2xl space-y-2 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5 font-cinzel">
              <PlayCircle size={16} className="text-amber-400" />
              {t('resumeSavedGame')}
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              En cours
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {t('savedGameDetails', {
              rank: t(savedGame.currentEnemy.rank.toLowerCase() as any) || savedGame.currentEnemy.rank,
              suit: t(savedGame.currentEnemy.suit.toLowerCase() as any) || savedGame.currentEnemy.suit,
              cards: savedGame.players[0]?.hand?.length || 0,
            })}
          </p>
          <button
            type="button"
            onClick={() => onResumeGame(savedGame)}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black tracking-wider text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            <PlayCircle size={16} />
            <span>{t('resumeSavedGame')}</span>
          </button>
        </div>
      )}

      {/* Mode Selection Tabs (Multiplayer disabled & strikethrough) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setGameMode('SOLO')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
            gameMode === 'SOLO'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={16} />
          <span>{t('solo')}</span>
        </button>

        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all text-slate-600 line-through cursor-not-allowed opacity-50 bg-slate-900/40 relative"
        >
          <Ban size={14} className="text-rose-500/60 no-underline shrink-0" />
          <span className="line-through">{t('multiplayer')}</span>
          <span className="text-[9px] bg-rose-950/80 text-rose-400 border border-rose-900/50 px-1 py-0.2 rounded font-sans no-underline ml-1">
            Bientôt
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Player Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            {t('playerName')}
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={15}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t('defaultSoloName')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Solo Info Box */}
        {gameMode === 'SOLO' && (
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-amber-400 flex items-center gap-1">
              <Swords size={14} /> Mode Solo Regicide (8 cartes en main)
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Affrontez seul les 12 ennemis de la Cour Royale. Vous disposez de 2 Jokers Solo pour réapprovisionner votre main à tout moment.
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || gameMode === 'MULTIPLAYER'}
          className={`w-full py-3.5 rounded-xl font-cinzel font-black tracking-wider text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
            gameMode === 'MULTIPLAYER'
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-amber-500/20 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <span>{t('connecting')}</span>
          ) : (
            <>
              <Swords size={18} />
              <span>{savedGame ? t('startSolo') : t('startSolo')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
