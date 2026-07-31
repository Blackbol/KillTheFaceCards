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
      <div className="w-56 h-80 sm:w-64 sm:h-96 rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-950/40 flex flex-col items-center justify-center text-slate-500 gap-3 p-6 text-center">
        <Sparkles size={40} className="text-amber-500/40 animate-pulse" />
        <span className="font-cinzel text-lg font-bold text-slate-400">{t('allEnemiesSlain')}</span>
        <span className="text-xs">{t('victoryDesc')}</span>
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
      className="relative w-56 h-80 sm:w-64 sm:h-96 rounded-2xl border-2 border-amber-600/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-5 shadow-2xl shadow-amber-950/30 flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black font-cinzel text-amber-400 tracking-wider">
            {enemyRankTranslated}
          </span>
          <SuitBadge suit={enemy.suit} size={22} showText />
        </div>
        <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-800/50 px-2.5 py-1 rounded-full text-rose-400 font-bold text-sm">
          <Swords size={16} />
          <span>{enemy.attack}</span>
        </div>
      </div>

      {/* Center Enemy Emblem & Immunity Status */}
      <div className="my-auto flex flex-col items-center justify-center gap-3">
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-2 border-amber-500/30 bg-slate-900/80 shadow-inner">
          <span className="text-4xl font-extrabold font-cinzel text-slate-100">
            {enemy.rank[0]}
          </span>
          <div className="absolute -bottom-1">
            <SuitBadge suit={enemy.suit} size={28} />
          </div>
        </div>

        {/* Immunity status badge */}
        {enemy.isImmunityCancelled ? (
          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles size={14} />
            <span>{t('immunityCancelled')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-rose-900/40 text-rose-400 text-xs font-medium px-3 py-1 rounded-full">
            <Ban size={14} />
            <span>{t('immuneTo')} <SuitBadge suit={enemy.suit} size={14} showText /></span>
          </div>
        )}

        {/* Spade Shield Indicator */}
        {enemy.currentShield > 0 && (
          <div className="flex items-center gap-1.5 bg-blue-950/70 border border-blue-600/50 text-blue-300 text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
            <Shield size={14} className="fill-blue-500/20" />
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
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold tracking-wide">
          <span className="text-slate-400">{t('healthPoints')}</span>
          <span className="text-emerald-400">
            {enemy.currentHp} / {enemy.maxHp} {t('hpUnit')}
          </span>
        </div>
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
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
