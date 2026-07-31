// 📁 src/components/PauseModal.tsx

import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { useI18n } from '../i18n/I18nContext';
import { Pause, Play, WifiOff } from 'lucide-react';

interface PauseModalProps {
  gameState: GameState | null;
  activePlayerId: string;
  onTogglePause: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  gameState,
  activePlayerId,
  onTogglePause,
}) => {
  const { t } = useI18n();
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  const isPaused = gameState?.isPaused ?? false;
  const activePlayer = gameState?.players.find((p) => p.id === activePlayerId);
  const isHost = activePlayer?.isHost ?? false;

  const discPlayer = gameState?.players.find((p) => p.isConnected === false);
  const isHostDisconnected = discPlayer?.isHost ?? false;

  useEffect(() => {
    if (!isPaused || !discPlayer) {
      setSecondsLeft(30);
      return;
    }

    // Synchronize timer with shared Firebase presence timestamp
    const discTime = discPlayer.disconnectedAt || Date.now();

    const updateCountdown = () => {
      const elapsedSec = Math.floor((Date.now() - discTime) / 1000);
      setSecondsLeft(Math.max(0, 30 - elapsedSec));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isPaused, discPlayer?.id, discPlayer?.disconnectedAt]);

  if (!gameState || !isPaused) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
          {discPlayer ? (
            <WifiOff size={32} className="animate-pulse text-rose-400" />
          ) : (
            <Pause size={32} className="animate-pulse text-amber-400" />
          )}
        </div>

        <h2 className="text-xl font-black font-cinzel text-amber-400 tracking-wider">
          {t('gamePausedTitle')}
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
          {discPlayer
            ? isHostDisconnected
              ? t('hostDisconnectCountdown', { name: discPlayer.name, sec: secondsLeft })
              : t('playerDisconnectCountdown', { name: discPlayer.name, sec: secondsLeft })
            : t('gamePausedDesc')}
        </p>

        {isHost ? (
          <button
            type="button"
            onClick={onTogglePause}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black tracking-wider text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Play size={16} />
            <span>
              {discPlayer && !isHostDisconnected
                ? t('unpauseByHost')
                : t('resumeGame')}
            </span>
          </button>
        ) : (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 italic animate-pulse">
            {t('waitingForPlayer')}
          </div>
        )}
      </div>
    </div>
  );
};
