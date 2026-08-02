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
      className="relative w-42 h-56 sm:w-56 sm:h-76 md:w-64 md:h-88 rounded-2xl border-2 border-amber-600/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-2.5 sm:p-4 shadow-2xl shadow-amber-950/40 flex flex-col justify-between select-none overflow-hidden shrink-0"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 gap-1.5 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          <span className="text-base sm:text-xl md:text-2xl font-black font-cinzel text-amber-400 tracking-wider truncate">
            {enemyRankTranslated}
          </span>
          <div className="sm:hidden">
            <SuitBadge suit={enemy.suit} size={14} showText={false} />
          </div>
          <div className="hidden sm:block">
            <SuitBadge suit={enemy.suit} size={18} showText />
          </div>
        </div>
        <div className="flex items-center gap-1 bg-rose-950/70 border border-rose-800/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-rose-400 font-extrabold text-[11px] sm:text-sm shrink-0 shadow-sm">
          <Swords size={12} />
          <span>{enemy.attack}</span>
        </div>
      </div>

      {/* Center Enemy Emblem & Badges Group */}
      <div className="my-auto flex flex-col items-center justify-center gap-1 sm:gap-1.5">
        <div className="relative flex items-center justify-center w-12 h-12 sm:w-18 sm:h-18 md:w-22 md:h-22 rounded-full border-2 border-amber-500/30 bg-slate-900/80 shadow-inner">
          <span className="text-xl sm:text-3xl md:text-4xl font-extrabold font-cinzel text-slate-100">
            {enemy.rank[0]}
          </span>
          <div className="absolute -bottom-1">
            <SuitBadge suit={enemy.suit} size={16} />
          </div>
        </div>

        {/* Immunity status badge */}
        {enemy.isImmunityCancelled ? (
          <div className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[9px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full leading-none shadow-sm">
            <Sparkles size={12} className="shrink-0 text-emerald-400" />
            <span>{t('immunityCancelled')}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 bg-slate-900/90 border border-rose-900/50 text-rose-400 text-[9px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full leading-none shadow-sm">
            <Ban size={12} className="shrink-0 text-rose-400" />
            <span className="inline-flex items-center leading-none">{t('immuneTo')}</span>
            <div className="sm:hidden inline-flex items-center">
              <SuitBadge suit={enemy.suit} size={12} showText={false} />
            </div>
            <div className="hidden sm:inline-flex items-center">
              <SuitBadge suit={enemy.suit} size={12} showText />
            </div>
          </div>
        )}

        {/* Spade Shield Indicator */}
        {enemy.currentShield > 0 && (
          <div className="inline-flex items-center gap-1 bg-blue-950/80 border border-blue-600/60 text-blue-300 text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-md animate-pulse leading-none">
            <Shield size={12} className="fill-blue-500/20 shrink-0" />
            <span>
              {t('shieldActive', {
                shield: enemy.currentShield,
                net: Math.max(0, enemy.attack - enemy.currentShield),
              })}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Polished Health Bar Card */}
      <div className="w-full bg-slate-950/80 border border-slate-800/90 rounded-xl p-1.5 sm:p-2 space-y-1 shadow-inner shrink-0">
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-extrabold tracking-wider">
          <span className="text-slate-400 uppercase tracking-widest">{t('healthPoints')}</span>
          <span className={`font-mono text-[11px] sm:text-xs font-black ${
            hpPercent > 50 ? 'text-emerald-400' : hpPercent > 20 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {enemy.currentHp} / {enemy.maxHp} {t('hpUnit')}
          </span>
        </div>
        <div className="h-2 sm:h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all duration-300 ${
              hpPercent > 50
                ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                : hpPercent > 20
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-400 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};
