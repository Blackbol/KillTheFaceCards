// 📁 src/components/HandView.tsx

import React from 'react';
import { Card, Enemy } from '../types/game';
import { CardView } from './CardView';
import { RegicideEngine } from '../engine/RegicideEngine';
import { Heart, Diamond, Club, Shield, AlertCircle } from 'lucide-react';

interface HandViewProps {
  hand: Card[];
  selectedCardIds: string[];
  onToggleSelect: (cardId: string) => void;
  currentEnemy: Enemy | null;
  disabled?: boolean;
}

export const HandView: React.FC<HandViewProps> = ({
  hand,
  selectedCardIds,
  onToggleSelect,
  currentEnemy,
  disabled = false,
}) => {
  const selectedCards = hand.filter((c) => selectedCardIds.includes(c.id));
  const validation = RegicideEngine.validatePlayedCards(selectedCards);
  
  const totalValue = selectedCards.reduce((sum, c) => sum + c.value, 0);

  // Helper checks for active suit powers
  const isImmune = (suit: string | null) =>
    currentEnemy && suit !== null && currentEnemy.suit === suit && !currentEnemy.isImmunityCancelled;

  const hasHearts = selectedCards.some((c) => c.suit === 'HEARTS') && !isImmune('HEARTS');
  const hasDiamonds = selectedCards.some((c) => c.suit === 'DIAMONDS') && !isImmune('DIAMONDS');
  const hasClubs = selectedCards.some((c) => c.suit === 'CLUBS') && !isImmune('CLUBS');
  const hasSpades = selectedCards.some((c) => c.suit === 'SPADES') && !isImmune('SPADES');

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Active Selection Summary & Combo Helper Bar */}
      {selectedCards.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm animate-fadeIn">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attack Value</span>
            <span className="text-lg font-black text-amber-400 font-cinzel">
              {totalValue * (hasClubs ? 2 : 1)}
            </span>
            {hasClubs && <span className="text-xs text-emerald-400 font-bold">(x2 Club Power)</span>}
          </div>

          {/* Suit Power Preview Badges */}
          <div className="flex items-center gap-2">
            {hasHearts && (
              <span className="inline-flex items-center gap-1 text-xs bg-rose-950/60 border border-rose-800/50 text-rose-300 font-medium px-2 py-0.5 rounded-full">
                <Heart size={12} className="fill-rose-400/20" /> Heal {totalValue}
              </span>
            )}
            {hasDiamonds && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-950/60 border border-blue-800/50 text-blue-300 font-medium px-2 py-0.5 rounded-full">
                <Diamond size={12} className="fill-blue-400/20" /> Recruit {totalValue}
              </span>
            )}
            {hasSpades && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 border border-slate-600 text-slate-300 font-medium px-2 py-0.5 rounded-full">
                <Shield size={12} className="fill-slate-400/20" /> Shield +{totalValue}
              </span>
            )}
            {hasClubs && (
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-medium px-2 py-0.5 rounded-full">
                <Club size={12} className="fill-emerald-400/20" /> Double Dmg
              </span>
            )}
          </div>

          {/* Validation Warning if selection invalid */}
          {!validation.valid && (
            <div className="flex items-center gap-1 text-xs text-rose-400 font-semibold pl-2">
              <AlertCircle size={14} />
              <span>{validation.reason}</span>
            </div>
          )}
        </div>
      )}

      {/* Cards Container */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl px-2">
        {hand.length === 0 ? (
          <div className="text-sm text-slate-500 italic py-4">Your hand is empty.</div>
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
