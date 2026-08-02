// 📁 src/components/CardView.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Card, Rank } from '../types/game';
import { SuitBadge } from './SuitBadge';
import { useI18n } from '../i18n/I18nContext';

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
  const { t } = useI18n();
  const isCourt = ['J', 'Q', 'K'].includes(card.rank);

  const getDisplayRank = (rank: Rank): string => {
    switch (rank) {
      case 'J':
        return t('rankJackDisplay');
      case 'Q':
        return t('rankQueenDisplay');
      case 'K':
        return t('rankKingDisplay');
      case 'A':
        return t('rankAceDisplay');
      default:
        return rank;
    }
  };

  const displayRank = getDisplayRank(card.rank);

  if (compact) {
    return (
      <motion.div
        className={`
          relative rounded-xl border flex flex-col justify-between p-1.5 text-left select-none overflow-hidden shrink-0 my-0.5
          w-12 h-16 sm:w-14 sm:h-18 text-[10px]
          border-amber-500/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-sm
        `}
      >
        <div className="flex items-center justify-between font-bold leading-none">
          <span className={`${card.isJoker ? 'text-purple-300' : 'text-slate-100'} font-cinzel text-xs`}>
            {displayRank}
          </span>
          <SuitBadge suit={card.suit} size={11} />
        </div>

        <div className="my-auto flex flex-col items-center justify-center">
          {card.isJoker ? (
            <span className="text-[9px] font-black text-purple-400 font-cinzel">JOKER</span>
          ) : (
            <span className="text-sm font-black text-slate-100 font-cinzel">{card.value}</span>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { y: -6, scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        relative rounded-xl border-2 transition-all duration-200 select-none flex flex-col justify-between p-1.5 sm:p-2.5 text-left shrink-0 overflow-hidden
        w-14 h-20 sm:w-20 sm:h-30 md:w-24 md:h-36 lg:w-26 lg:h-38 text-xs sm:text-sm
        ${
          isSelected
            ? 'border-amber-400 bg-slate-800 shadow-lg shadow-amber-500/20 -translate-y-2.5 ring-2 ring-amber-400'
            : 'border-slate-700 bg-slate-900/90 hover:border-slate-500 shadow-md'
        }
        ${isCourt ? 'border-amber-600/40 bg-gradient-to-b from-slate-900 to-slate-950' : ''}
        ${card.isJoker ? 'border-purple-500/60 bg-gradient-to-b from-purple-950/40 to-slate-900' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Top Rank & Suit */}
      <div className="flex items-center justify-between font-bold tracking-tight leading-none">
        <span className={`${card.isJoker ? 'text-purple-300' : 'text-slate-100'} text-xs sm:text-base font-cinzel`}>
          {displayRank}
        </span>
        <SuitBadge suit={card.suit} size={16} />
      </div>

      {/* Center Value / Emblem */}
      <div className="my-auto flex flex-col items-center justify-center">
        {card.isJoker ? (
          <span className="text-sm sm:text-xl font-black text-purple-400 tracking-wider font-cinzel">
            JOKER
          </span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 font-cinzel">
              {card.value}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Rank inverted */}
      <div className="flex items-center justify-between rotate-180 opacity-70 leading-none">
        <span className="font-bold font-cinzel text-[10px] sm:text-xs">{displayRank}</span>
        <SuitBadge suit={card.suit} size={10} />
      </div>
    </motion.button>
  );
};
