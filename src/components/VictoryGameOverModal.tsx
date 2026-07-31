// 📁 src/components/VictoryGameOverModal.tsx

import React from 'react';
import { GameState } from '../types/game';
import { useI18n } from '../i18n/I18nContext';
import { Trophy, Skull, RotateCcw, PlayCircle } from 'lucide-react';

interface VictoryGameOverModalProps {
  gameState: GameState;
  activePlayerId?: string;
  onReset: () => void;
  onRematch?: () => void;
}

export const VictoryGameOverModal: React.FC<VictoryGameOverModalProps> = ({
  gameState,
  activePlayerId,
  onReset,
  onRematch,
}) => {
  const { t } = useI18n();
  const isVictory = gameState.status === 'VICTORY';
  const isGameOver = gameState.status === 'GAME_OVER';

  if (!isVictory && !isGameOver) return null;

  const isMultiplayer = gameState.mode === 'MULTIPLAYER';
  const activePlayer = gameState.players.find((p) => p.id === activePlayerId);
  const isHost = activePlayer?.isHost ?? false;

  let medalText = '';
  let medalColor = '';

  if (isVictory && gameState.mode === 'SOLO') {
    const usedJokers = gameState.soloJokers.usedCount;
    if (usedJokers === 0) {
      medalText = t('goldMedal');
      medalColor = 'text-amber-400 border-amber-500/50 bg-amber-950/40';
    } else if (usedJokers === 1) {
      medalText = t('silverMedal');
      medalColor = 'text-slate-300 border-slate-400/50 bg-slate-900/60';
    } else {
      medalText = t('bronzeMedal');
      medalColor = 'text-orange-400 border-orange-600/50 bg-orange-950/40';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl border-2 border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6 text-center">
        {isVictory ? (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-amber-400 animate-bounce">
              <Trophy size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-cinzel text-amber-400 tracking-wider">
                {t('victory')}
              </h2>
              <p className="text-xs text-slate-300">
                {t('victoryDesc')}
              </p>
            </div>

            {medalText && (
              <div className={`px-4 py-2 rounded-xl border text-xs font-bold font-cinzel ${medalColor}`}>
                {medalText}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-rose-950/60 border-2 border-rose-600 flex items-center justify-center text-rose-500 animate-pulse">
              <Skull size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-cinzel text-rose-500 tracking-wider">
                {t('gameOver')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('gameOverDesc')}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 w-full">
          {isMultiplayer && onRematch && (
            isHost ? (
              <button
                type="button"
                onClick={onRematch}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-cinzel px-6 py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-xl w-full active:scale-[0.99]"
              >
                <PlayCircle size={18} />
                <span>{t('rematchRoom')}</span>
              </button>
            ) : (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 italic text-center animate-pulse">
                {t('waitingHostRematch')}
              </div>
            )
          )}

          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold font-cinzel px-6 py-3 rounded-xl border border-slate-700 text-xs transition-all shadow-lg w-full"
          >
            <RotateCcw size={16} />
            <span>{t('returnToLobby')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
