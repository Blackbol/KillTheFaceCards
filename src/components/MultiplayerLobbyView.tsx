// 📁 src/components/MultiplayerLobbyView.tsx

import React, { useState } from 'react';
import { GameState } from '../types/game';
import { useI18n } from '../i18n/I18nContext';
import { Copy, Check, Crown, Users, Clock, Swords, Key } from 'lucide-react';

interface MultiplayerLobbyViewProps {
  gameState: GameState;
  activePlayerId: string;
  onSetTurnTimer: (seconds: number) => void;
  onStartGame: () => void;
}

export const MultiplayerLobbyView: React.FC<MultiplayerLobbyViewProps> = ({
  gameState,
  activePlayerId,
  onSetTurnTimer,
  onStartGame,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState<boolean>(false);

  const activePlayer = gameState.players.find((p) => p.id === activePlayerId);
  const isHost = activePlayer?.isHost ?? false;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timerOptions = [
    { label: t('unlimitedTimer'), seconds: 0 },
    { label: t('timerSeconds', { sec: 5 }), seconds: 5 },
    { label: t('timerSeconds', { sec: 10 }), seconds: 10 },
    { label: t('timerSeconds', { sec: 15 }), seconds: 15 },
    { label: t('timerSeconds', { sec: 20 }), seconds: 20 },
    { label: t('timerSeconds', { sec: 25 }), seconds: 25 },
    { label: t('timerSeconds', { sec: 30 }), seconds: 30 },
    { label: t('timerSeconds', { sec: 60 }), seconds: 60 },
    { label: t('timerSeconds', { sec: 90 }), seconds: 90 },
  ];

  return (
    <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-1.5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-amber-400 font-cinzel font-black text-xl">
          <Users size={24} />
          <span>{t('waitingRoomTitle')}</span>
        </div>
        <p className="text-xs text-slate-400">
          {t('playersInLobby', { current: gameState.players.length, max: 4 })}
        </p>
      </div>

      {/* Copyable Room Code Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-4 rounded-2xl flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Key size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('roomCode')}</div>
            <div className="text-2xl font-black font-mono text-amber-400 tracking-widest">
              {gameState.roomId}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition-all active:scale-95"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-400" />
              <span className="text-emerald-400">{t('codeCopied')}</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>{t('copyCode')}</span>
            </>
          )}
        </button>
      </div>

      {/* Players List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          {t('playersInLobby', { current: gameState.players.length, max: 4 })}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${player.id === activePlayerId
                  ? 'border-amber-400/60 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300'
                }`}
            >
              <div className="flex items-center gap-2 truncate">
                {player.isHost && <Crown size={14} className="text-amber-400 shrink-0" />}
                <span className="truncate">{player.name}</span>
              </div>
              {player.isHost && (
                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono shrink-0">
                  {t('hostBadge')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Host Settings: Turn Timer */}
      {isHost ? (
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Clock size={16} />
            <span>{t('turnTimerLabel')}</span>
          </div>

          <select
            value={gameState.turnTimer?.seconds || 0}
            onChange={(e) => onSetTurnTimer(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {timerOptions.map((opt) => (
              <option key={opt.seconds} value={opt.seconds}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 italic text-center animate-pulse">
          {t('waitingForPlayer')}
        </div>
      )}

      {/* Start Game Button (Host only) */}
      {isHost && (
        <button
          type="button"
          onClick={onStartGame}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black tracking-wider text-sm rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Swords size={18} />
          <span>{t('startGameBtn')}</span>
        </button>
      )}
    </div>
  );
};
