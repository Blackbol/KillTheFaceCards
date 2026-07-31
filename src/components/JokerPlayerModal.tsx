// 📁 src/components/JokerPlayerModal.tsx

import React from 'react';
import { GameState } from '../types/game';
import { useI18n } from '../i18n/I18nContext';
import { Sparkles, UserCheck } from 'lucide-react';

interface JokerPlayerModalProps {
  gameState: GameState | null;
  activePlayerId: string;
  onSelectPlayer: (targetPlayerId: string) => void;
}

export const JokerPlayerModal: React.FC<JokerPlayerModalProps> = ({
  gameState,
  activePlayerId,
  onSelectPlayer,
}) => {
  const { t } = useI18n();

  if (!gameState || gameState.status !== 'YIELD_JOKER_CHOICE') return null;

  const isMyTurnToSelect = gameState.currentTurnPlayerId === activePlayerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto">
          <Sparkles size={28} className="animate-pulse" />
        </div>

        <h2 className="text-xl font-black font-cinzel text-purple-300 tracking-wider">
          {t('jokerPlayedSelectNext')}
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t('jokerPlayedDescription')}
        </p>

        {isMyTurnToSelect ? (
          <div className="flex flex-col gap-2 pt-2">
            {gameState.players.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => onSelectPlayer(player.id)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-slate-100 font-cinzel font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 border border-purple-400/40 active:scale-[0.99]"
              >
                <UserCheck size={18} />
                <span>{player.name} ({player.hand.length} {t('cardPlural')})</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 italic animate-pulse">
            {t('waitingForPlayer')}
          </div>
        )}
      </div>
    </div>
  );
};
