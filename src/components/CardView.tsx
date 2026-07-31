// 📁 src/components/CardView.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types/game';
import { SuitBadge } from './SuitBadge';

interface CardViewProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  isSelected = false,
  onClick,
  disabled = false,
  compact = false,
}) => {
  const isCourt = ['J', 'Q', 'K'].includes(card.rank);

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { y: -8, scale: 1.04 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        relative rounded-xl border-2 transition-all duration-200 select-none flex flex-col justify-between p-2.5 text-left
        ${compact ? 'w-16 h-24 text-xs' : 'w-24 h-36 sm:w-28 sm:h-40 text-sm'}
        ${
          isSelected
            ? 'border-amber-400 bg-slate-800 shadow-lg shadow-amber-500/20 -translate-y-4 ring-2 ring-amber-400'
            : 'border-slate-700 bg-slate-900/90 hover:border-slate-500 shadow-md'
        }
        ${isCourt ? 'border-amber-600/40 bg-gradient-to-b from-slate-900 to-slate-950' : ''}
        ${card.isJoker ? 'border-purple-500/60 bg-gradient-to-b from-purple-950/40 to-slate-900' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Top Rank & Suit */}
      <div className="flex items-center justify-between font-bold tracking-tight">
        <span className={`${card.isJoker ? 'text-purple-300' : 'text-slate-100'} text-base sm:text-lg font-cinzel`}>
          {card.rank}
        </span>
        <SuitBadge suit={card.suit} size={compact ? 14 : 18} />
      </div>

      {/* Center Value / Emblem */}
      <div className="my-auto flex flex-col items-center justify-center">
        {card.isJoker ? (
          <span className="text-xl sm:text-2xl font-black text-purple-400 tracking-wider font-cinzel">
            JOKER
          </span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-cinzel">
              {card.value}
            </span>
            {isCourt && (
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mt-0.5">
                Court
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Rank inverted */}
      <div className="flex items-center justify-between rotate-180 opacity-70">
        <span className="font-bold font-cinzel text-xs">{card.rank}</span>
        <SuitBadge suit={card.suit} size={12} />
      </div>
    </motion.button>
  );
};
