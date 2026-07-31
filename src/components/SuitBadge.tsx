// 📁 src/components/SuitBadge.tsx

import React from 'react';
import { Suit } from '../types/game';
import { Heart, Diamond, Club, Shield } from 'lucide-react';

interface SuitBadgeProps {
  suit: Suit | null;
  size?: number;
  showText?: boolean;
}

export const SuitBadge: React.FC<SuitBadgeProps> = ({ suit, size = 18, showText = false }) => {
  if (!suit) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-purple-400">
        ★ {showText && 'Joker'}
      </span>
    );
  }

  switch (suit) {
    case 'HEARTS':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
          <Heart size={size} className="fill-rose-500/20" />
          {showText && 'Hearts'}
        </span>
      );
    case 'DIAMONDS':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-blue-500">
          <Diamond size={size} className="fill-blue-500/20" />
          {showText && 'Diamonds'}
        </span>
      );
    case 'CLUBS':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-500">
          <Club size={size} className="fill-emerald-500/20" />
          {showText && 'Clubs'}
        </span>
      );
    case 'SPADES':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
          <Shield size={size} className="fill-slate-400/20" />
          {showText && 'Spades'}
        </span>
      );
  }
};
