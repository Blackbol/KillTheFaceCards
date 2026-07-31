// 📁 src/components/LobbyModal.tsx

import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { GameState } from '../types/game';
import { loadSavedSoloGame } from '../utils/saveGame';
import { User, Users, Swords, Crown, PlayCircle, Key, PlusCircle, LogIn } from 'lucide-react';

interface LobbyModalProps {
  onCreateGame: (playerName: string, mode: 'SOLO' | 'MULTIPLAYER') => void;
  onJoinGame?: (roomCode: string, playerName: string) => Promise<boolean>;
  onResumeGame: (savedState: GameState) => void;
  isLoading?: boolean;
}

const PLAYER_NAME_COOKIE = 'killthefacecards_player_name';
const PLAYER_MODE_COOKIE = 'killthefacecards_last_mode';
const PLAYER_MP_TAB_COOKIE = 'killthefacecards_last_mp_tab';

export const LobbyModal: React.FC<LobbyModalProps> = ({
  onCreateGame,
  onJoinGame,
  onResumeGame,
  isLoading = false,
}) => {
  const { t } = useI18n();

  const [gameMode, setGameModeState] = useState<'SOLO' | 'MULTIPLAYER'>(() => {
    const saved = localStorage.getItem(PLAYER_MODE_COOKIE);
    return saved === 'MULTIPLAYER' ? 'MULTIPLAYER' : 'SOLO';
  });

  const [multiplayerAction, setMultiplayerActionState] = useState<'CREATE' | 'JOIN'>(() => {
    const saved = localStorage.getItem(PLAYER_MP_TAB_COOKIE);
    return saved === 'JOIN' ? 'JOIN' : 'CREATE';
  });

  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem(PLAYER_NAME_COOKIE) || '';
  });
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [savedGame, setSavedGame] = useState<GameState | null>(null);

  const setGameMode = (mode: 'SOLO' | 'MULTIPLAYER') => {
    setGameModeState(mode);
    localStorage.setItem(PLAYER_MODE_COOKIE, mode);
  };

  const setMultiplayerAction = (act: 'CREATE' | 'JOIN') => {
    setMultiplayerActionState(act);
    localStorage.setItem(PLAYER_MP_TAB_COOKIE, act);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      playerName.trim() ||
      (gameMode === 'SOLO'
        ? t('defaultSoloName')
        : multiplayerAction === 'CREATE'
        ? t('defaultHostName')
        : t('defaultJoinName'));

    localStorage.setItem(PLAYER_NAME_COOKIE, finalName);
    localStorage.setItem(PLAYER_MODE_COOKIE, gameMode);
    localStorage.setItem(PLAYER_MP_TAB_COOKIE, multiplayerAction);

    if (gameMode === 'SOLO') {
      onCreateGame(finalName, 'SOLO');
    } else {
      if (multiplayerAction === 'CREATE') {
        onCreateGame(finalName, 'MULTIPLAYER');
      } else {
        if (!roomCodeInput.trim() || !onJoinGame) return;
        await onJoinGame(roomCodeInput.trim(), finalName);
      }
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

      {/* Resume Saved Game Banner if available */}
      {savedGame && savedGame.currentEnemy && gameMode === 'SOLO' && (
        <div className="mb-5 bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-500/40 p-3.5 rounded-2xl space-y-2 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5 font-cinzel">
              <PlayCircle size={16} className="text-amber-400" />
              {t('resumeSavedGame')}
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              SOLO
            </span>
          </div>

          <div className="text-xs text-slate-300">
            {t('savedGameDetails', {
              rank: t(savedGame.currentEnemy.rank.toLowerCase() as any) || savedGame.currentEnemy.rank,
              suit: t(savedGame.currentEnemy.suit.toLowerCase() as any) || savedGame.currentEnemy.suit,
              cards: savedGame.players[0]?.hand.length || 0,
            })}
          </div>

          <button
            type="button"
            onClick={() => onResumeGame(savedGame)}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-cinzel text-xs rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-1.5"
          >
            <PlayCircle size={15} />
            <span>{t('resumeSavedGame')}</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Game Mode Selector (Solo vs Multiplayer) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setGameMode('SOLO')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-cinzel font-bold text-xs transition-all ${
              gameMode === 'SOLO'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={16} />
            <span>{t('solo')}</span>
          </button>

          <button
            type="button"
            onClick={() => setGameMode('MULTIPLAYER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-cinzel font-bold text-xs transition-all ${
              gameMode === 'MULTIPLAYER'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={16} />
            <span>{t('multiplayer')}</span>
          </button>
        </div>

        {/* Player Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            {t('playerName')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t('playerPlaceholder')}
              maxLength={16}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Multiplayer Action Tabs (Create vs Join) */}
        {gameMode === 'MULTIPLAYER' && (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => setMultiplayerAction('CREATE')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  multiplayerAction === 'CREATE'
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlusCircle size={14} />
                <span>{t('createRoom')}</span>
              </button>

              <button
                type="button"
                onClick={() => setMultiplayerAction('JOIN')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  multiplayerAction === 'JOIN'
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn size={14} />
                <span>{t('joinRoom')}</span>
              </button>
            </div>

            {/* Room Code Input for Join Action */}
            {multiplayerAction === 'JOIN' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  {t('roomCode')}
                </label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder={t('roomCodePlaceholder')}
                    maxLength={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono tracking-widest text-amber-400 uppercase placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hand limits quick reference info */}
        <div className="text-[11px] text-slate-500 italic text-center pt-1">
          {t('handLimitsInfo')}
        </div>

        {/* Action Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (gameMode === 'MULTIPLAYER' && multiplayerAction === 'JOIN' && !roomCodeInput.trim())}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-cinzel font-black tracking-wider text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          {isLoading ? (
            <span>{t('connecting')}</span>
          ) : (
            <>
              <Swords size={18} />
              <span>
                {gameMode === 'SOLO'
                  ? t('startSolo')
                  : multiplayerAction === 'CREATE'
                  ? t('createRoom')
                  : t('joinRoom')}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
