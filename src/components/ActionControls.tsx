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
      <div className="w-full text-center py-3 text-sm text-slate-400 font-semibold bg-slate-900/60 border border-slate-800 rounded-xl">
        {t('waitingForPlayer')}
      </div>
    );
  }

  if (isJokerChoicePhase && isMyTurn) {
    return (
      <div className="w-full bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-4 shadow-xl flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-purple-300 font-bold font-cinzel text-base">
          <Sparkles size={18} />
          <span>{t('jokerPlayedSelectNext')}</span>
        </div>
        <p className="text-xs text-slate-400 text-center">
          {t('jokerPlayedDescription')}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {gameState.players.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectJokerPlayer(p.id)}
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {isDiscardPhase ? (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert size={20} className="animate-bounce" />
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
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                {t('clear')}
              </button>
            )}
            <button
              type="button"
              onClick={onDiscardForDamage}
              disabled={selectedCardIds.length === 0 || disabled}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-950/40 text-sm transition-all"
            >
              <Trash2 size={16} />
              <span>{t('discardSelected')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {selectedCardIds.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              {t('clear')}
            </button>
          )}

          <button
            type="button"
            onClick={onPlayCards}
            disabled={selectedCardIds.length === 0 || disabled}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg shadow-amber-950/40 text-sm tracking-wide transition-all uppercase font-cinzel"
          >
            <Swords size={18} />
            <span>{t('attack', { count: selectedCardIds.length })}</span>
          </button>

          <button
            type="button"
            onClick={onPassTurn}
            disabled={disabled}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-sm border border-slate-700 transition-all"
          >
            <FastForward size={16} />
            <span>{t('passTurn')}</span>
          </button>

          {gameState.mode === 'SOLO' && gameState.soloJokers.availableCount > 0 && (
            <button
              type="button"
              onClick={onUseSoloJoker}
              disabled={disabled}
              className="flex items-center gap-2 bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all"
            >
              <Sparkles size={16} />
              <span>{t('useSoloJoker', { count: gameState.soloJokers.availableCount })}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
