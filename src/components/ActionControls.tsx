// 📁 src/components/ActionControls.tsx

import React from 'react';
import { GameState } from '../types/game';
import { useI18n } from '../i18n/I18nContext';
import { Swords, ShieldAlert, FastForward, Sparkles, Trash2 } from 'lucide-react';

interface ActionControlsProps {
  gameState: GameState;
  activePlayerId: string;
  selectedCardIds: string[];
  onPlayCards: () => void;
  onDiscardForDamage: () => void;
  onPassTurn: () => void;
  onUseSoloJoker: () => void;
  onSelectJokerPlayer: (targetId: string) => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  gameState,
  activePlayerId,
  selectedCardIds,
  onPlayCards,
  onDiscardForDamage,
  onPassTurn,
  onUseSoloJoker,
  onSelectJokerPlayer,
  onClearSelection,
  disabled = false,
}) => {
  const { t } = useI18n();
  const isMyTurn = gameState.currentTurnPlayerId === activePlayerId;
  const isDiscardPhase = gameState.status === 'DISCARD_DAMAGE';
  const isJokerChoicePhase = gameState.status === 'YIELD_JOKER_CHOICE';

  if (!isMyTurn && !isJokerChoicePhase) {
    return (
      <div className="w-full text-center py-2.5 px-4 text-xs sm:text-sm text-slate-400 font-semibold bg-slate-900/80 border border-slate-800 rounded-xl shadow-md">
        {t('waitingForPlayer')}
      </div>
    );
  }

  if (isJokerChoicePhase && isMyTurn) {
    return (
      <div className="w-full bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-purple-300 font-bold font-cinzel text-xs sm:text-sm">
          <Sparkles size={16} />
          <span>{t('jokerPlayedSelectNext')}</span>
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          {t('jokerPlayedDescription')}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {gameState.players.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectJokerPlayer(p.id)}
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 sm:p-3 bg-slate-900/90 border border-slate-800 rounded-xl md:rounded-2xl shadow-xl flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 shrink-0">
      {isDiscardPhase ? (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs sm:text-sm">
            <ShieldAlert size={18} className="animate-bounce shrink-0" />
            <span>
              {t('endureDamage', {
                current: gameState.discardedDamageSum,
                required: gameState.pendingDamage,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedCardIds.length > 0 && (
              <button
                type="button"
                onClick={onClearSelection}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                {t('clear')}
              </button>
            )}
            <button
              type="button"
              onClick={onDiscardForDamage}
              disabled={selectedCardIds.length === 0 || disabled}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-lg shadow-rose-950/40 text-xs sm:text-sm transition-all"
            >
              <Trash2 size={15} />
              <span>{t('discardSelected')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {selectedCardIds.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              {t('clear')}
            </button>
          )}

          <button
            type="button"
            onClick={onPlayCards}
            disabled={selectedCardIds.length === 0 || disabled}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl shadow-lg shadow-amber-950/40 text-xs sm:text-sm tracking-wide transition-all uppercase font-cinzel"
          >
            <Swords size={16} />
            <span>{t('attack', { count: selectedCardIds.length })}</span>
          </button>

          <button
            type="button"
            onClick={onPassTurn}
            disabled={disabled}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition-all"
          >
            <FastForward size={14} />
            <span>{t('passTurn')}</span>
          </button>

          {gameState.mode === 'SOLO' && gameState.soloJokers.availableCount > 0 && (
            <button
              type="button"
              onClick={onUseSoloJoker}
              disabled={disabled}
              className="flex items-center gap-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all"
            >
              <Sparkles size={14} />
              <span>{t('useSoloJoker', { count: gameState.soloJokers.availableCount })}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
