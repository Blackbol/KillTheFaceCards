// 📁 src/components/SuitBadge.tsx

import React from 'react';
import { Suit } from '../types/game';
import { useI18n } from '../i18n/I18nContext';
import { Heart, Diamond, Club, Shield } from 'lucide-react';

interface SuitBadgeProps {
  suit: Suit | null;
  size?: number;
  showText?: boolean;
}

export const SuitBadge: React.FC<SuitBadgeProps> = ({ suit, size = 18, showText = false }) => {
  const { t } = useI18n();

  if (!suit) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-purple-400">
        ★ {showText && t('joker')}
      </span>
    );
  }

  switch (suit) {
    case 'HEARTS':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
          <Heart size={size} className="fill-rose-500/20" />
          {showText && t('hearts')}
        </span>
      );
    case 'DIAMONDS':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-blue-500">
          <Diamond size={size} className="fill-blue-500/20" />
          {showText && t('diamonds')}
        </span>
      );
    case 'CLUBS':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-500">
          <Club size={size} className="fill-emerald-500/20" />
          {showText && t('clubs')}
        </span>
      );
    case 'SPADES':
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
          <Shield size={size} className="fill-slate-400/20" />
          {showText && t('spades')}
        </span>
      );
  }
};
