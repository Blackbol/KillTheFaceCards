// 📁 src/components/HandView.tsx

import React from 'react';
import { Card, Enemy, GameState } from '../types/game';
import { CardView } from './CardView';
import { RegicideEngine } from '../engine/RegicideEngine';
import { useI18n } from '../i18n/I18nContext';
import { Heart, Diamond, Club, Shield, AlertCircle, ShieldAlert } from 'lucide-react';

interface HandViewProps {
  hand: Card[];
  selectedCardIds: string[];
  onToggleSelect: (cardId: string) => void;
  currentEnemy: Enemy | null;
  gameState?: GameState | null;
  disabled?: boolean;
}

export const HandView: React.FC<HandViewProps> = ({
  hand,
  selectedCardIds,
  onToggleSelect,
  currentEnemy,
  gameState,
  disabled = false,
}) => {
  const { t } = useI18n();
  const selectedCards = hand.filter((c) => selectedCardIds.includes(c.id));
  const isDiscardPhase = gameState?.status === 'DISCARD_DAMAGE';

  const validation = RegicideEngine.validatePlayedCards(selectedCards);
  const totalValue = selectedCards.reduce((sum, c) => sum + c.value, 0);

  const isImmune = (suit: string | null) =>
    currentEnemy && suit !== null && currentEnemy.suit === suit && !currentEnemy.isImmunityCancelled;

  const hasHearts = selectedCards.some((c) => c.suit === 'HEARTS') && !isImmune('HEARTS');
  const hasDiamonds = selectedCards.some((c) => c.suit === 'DIAMONDS') && !isImmune('DIAMONDS');
  const hasClubs = selectedCards.some((c) => c.suit === 'CLUBS') && !isImmune('CLUBS');
  const hasSpades = selectedCards.some((c) => c.suit === 'SPADES') && !isImmune('SPADES');

  return (
    <div className="w-full flex flex-col items-center gap-1 shrink-0 z-20">
      {/* Reserved Fixed-Height Slot for Preview Badges */}
      <div className="h-8 sm:h-9 w-full flex items-center justify-center shrink-0 z-30 relative">
        {selectedCards.length > 0 ? (
          isDiscardPhase ? (
            /* Dedicated Discard Damage Phase Preview Box */
            <div className="flex items-center gap-2 bg-rose-950/95 border border-rose-700/80 text-rose-200 rounded-xl px-3 py-1 shadow-xl backdrop-blur-md animate-fadeIn text-xs z-30">
              <ShieldAlert size={14} className="text-rose-400 shrink-0 animate-pulse" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider">{t('discardValue')}</span>
                <span className="text-base font-black text-rose-300 font-cinzel">
                  {totalValue} PV
                </span>
              </div>
            </div>
          ) : (
            /* Attack Phase Preview Box */
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/95 border border-slate-700/80 rounded-xl px-3 py-1 shadow-xl backdrop-blur-md animate-fadeIn text-xs z-30">
              <div className="flex items-center gap-1.5 border-r border-slate-800 pr-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t('attackValue')}</span>
                <span className="text-base font-black text-amber-400 font-cinzel">
                  {totalValue * (hasClubs ? 2 : 1)}
                </span>
                {hasClubs && <span className="text-[10px] text-emerald-400 font-bold">({t('doubleDmg')})</span>}
              </div>

              <div className="flex items-center gap-1.5">
                {hasHearts && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-rose-950/60 border border-rose-800/50 text-rose-300 font-medium px-2 py-0.5 rounded-full">
                    <Heart size={10} className="fill-rose-400/20" /> {t('heal')} {totalValue}
                  </span>
                )}
                {hasDiamonds && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-950/60 border border-blue-800/50 text-blue-300 font-medium px-2 py-0.5 rounded-full">
                    <Diamond size={10} className="fill-blue-400/20" /> {t('recruit')} {totalValue}
                  </span>
                )}
                {hasSpades && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 border border-slate-600 text-slate-300 font-medium px-2 py-0.5 rounded-full">
                    <Shield size={10} className="fill-slate-400/20" /> {t('shield')} +{totalValue}
                  </span>
                )}
                {hasClubs && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-medium px-2 py-0.5 rounded-full">
                    <Club size={10} className="fill-emerald-400/20" /> {t('doubleDmg')}
                  </span>
                )}
              </div>

              {!validation.valid && (
                <div className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold pl-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>
                    {validation.reason
                      ? t(validation.reason as any, { sum: totalValue, ...(validation.params || {}) })
                      : ''}
                  </span>
                </div>
              )}
            </div>
          )
        ) : null}
      </div>

      {/* Cards Hand Container */}
      <div className="w-full flex overflow-x-auto max-w-full pb-1 pt-3 sm:pt-5 px-1 flex-nowrap md:flex-wrap justify-start md:justify-center items-center gap-1.5 sm:gap-2 no-scrollbar shrink-0">
        {hand.length === 0 ? (
          <div className="w-full text-center text-xs text-slate-500 italic py-1">{t('handEmpty')}</div>
        ) : (
          hand.map((card) => (
            <CardView
              key={card.id}
              card={card}
              isSelected={selectedCardIds.includes(card.id)}
              onClick={() => onToggleSelect(card.id)}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
};
