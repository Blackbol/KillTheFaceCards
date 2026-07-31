// 📁 src/components/EnemyCardView.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Enemy } from '../types/game';
import { SuitBadge } from './SuitBadge';
import { useI18n } from '../i18n/I18nContext';
import { Shield, Swords, Ban, Sparkles } from 'lucide-react';

interface EnemyCardViewProps {
  enemy: Enemy | null;
}

export const EnemyCardView: React.FC<EnemyCardViewProps> = ({ enemy }) => {
  const { t } = useI18n();

  if (!enemy) {
    return (
      <div className="w-44 h-60 sm:w-56 sm:h-80 md:w-64 md:h-88 rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-950/40 flex flex-col items-center justify-center text-slate-500 gap-3 p-4 text-center">
        <Sparkles size={32} className="text-amber-500/40 animate-pulse" />
        <span className="font-cinzel text-sm sm:text-base font-bold text-slate-400">{t('allEnemiesSlain')}</span>
        <span className="text-[11px]">{t('victoryDesc')}</span>
      </div>
    );
  }

  const enemyRankTranslated =
    enemy.rank === 'JACK' ? t('jack') : enemy.rank === 'QUEEN' ? t('queen') : t('king');

  const hpPercent = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-44 h-60 sm:w-56 sm:h-80 md:w-64 md:h-88 rounded-2xl border-2 border-amber-600/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-3 sm:p-4 shadow-2xl shadow-amber-950/30 flex flex-col justify-between select-none overflow-hidden shrink-0"
    >
      {/* Top Banner: Icon only on small mobile to prevent text overlap, full text on desktop */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-lg sm:text-2xl font-black font-cinzel text-amber-400 tracking-wider">
            {enemyRankTranslated}
          </span>
          <div className="sm:hidden">
            <SuitBadge suit={enemy.suit} size={16} showText={false} />
          </div>
          <div className="hidden sm:block">
            <SuitBadge suit={enemy.suit} size={20} showText />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-rose-400 font-extrabold text-xs sm:text-sm shrink-0 shadow-sm">
          <Swords size={13} />
          <span>{enemy.attack}</span>
        </div>
      </div>

      {/* Center Enemy Emblem & Immunity Status */}
      <div className="my-auto flex flex-col items-center justify-center gap-2 sm:gap-3">
        <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-amber-500/30 bg-slate-900/80 shadow-inner">
          <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-cinzel text-slate-100">
            {enemy.rank[0]}
          </span>
          <div className="absolute -bottom-1">
            <SuitBadge suit={enemy.suit} size={20} />
          </div>
        </div>

        {/* Immunity status badge aligned perfectly */}
        {enemy.isImmunityCancelled ? (
          <div className="inline-flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full leading-none">
            <Sparkles size={13} className="shrink-0" />
            <span>{t('immunityCancelled')}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-slate-900/90 border border-rose-900/50 text-rose-400 text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full leading-none">
            <Ban size={13} className="shrink-0" />
            <span className="inline-flex items-center leading-none">{t('immuneTo')}</span>
            <div className="sm:hidden inline-flex items-center">
              <SuitBadge suit={enemy.suit} size={13} showText={false} />
            </div>
            <div className="hidden sm:inline-flex items-center">
              <SuitBadge suit={enemy.suit} size={13} showText />
            </div>
          </div>
        )}

        {/* Spade Shield Indicator */}
        {enemy.currentShield > 0 && (
          <div className="inline-flex items-center gap-1.5 bg-blue-950/80 border border-blue-600/60 text-blue-300 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse leading-none">
            <Shield size={13} className="fill-blue-500/20 shrink-0" />
            <span>
              {t('shieldActive', {
                shield: enemy.currentShield,
                net: Math.max(0, enemy.attack - enemy.currentShield),
              })}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Health Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] sm:text-xs font-bold tracking-wide">
          <span className="text-slate-400">{t('healthPoints')}</span>
          <span className="text-emerald-400">
            {enemy.currentHp} / {enemy.maxHp} {t('hpUnit')}
          </span>
        </div>
        <div className="h-2.5 sm:h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.3 }}
            className={`h-full rounded-full ${
              hpPercent > 50
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                : hpPercent > 20
                ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                : 'bg-gradient-to-r from-rose-600 to-rose-400'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};
