// 📁 src/components/RulesModal.tsx

import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { BookOpen, X, Swords, Heart, Diamond, Club, Shield, Sparkles, Flame, ShieldAlert, Ban, FastForward, Users } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl border-2 border-amber-600/40 bg-slate-900 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-black font-cinzel text-amber-400 tracking-wide">
              {t('rulesTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Objective & Enemies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold font-cinzel text-amber-400 text-base">
                <Swords size={18} />
                <span>{t('rulesGoalTitle')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('rulesGoalDesc')}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 font-bold font-cinzel text-amber-400 text-base">
                <Users size={18} />
                <span>{t('rulesEnemiesTitle')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('rulesEnemiesDesc')}
              </p>
            </div>
          </div>

          {/* Turn Structure */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
            <h3 className="font-bold font-cinzel text-amber-400 text-base flex items-center gap-2">
              <Sparkles size={18} />
              <span>{t('rulesTurnStructureTitle')}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('rulesTurnStructureDesc')}
            </p>
          </div>

          {/* Suit Powers */}
          <div className="space-y-3">
            <h3 className="font-bold font-cinzel text-amber-400 text-base flex items-center gap-2">
              <Sparkles size={18} />
              <span>{t('rulesSuitsTitle')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-rose-950/30 border border-rose-900/40 p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <Heart size={16} className="fill-rose-500/20" />
                  <span>{t('hearts')} ({t('heal')})</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-normal">
                  {t('rulesHeartsDesc')}
                </p>
              </div>

              <div className="bg-blue-950/30 border border-blue-900/40 p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Diamond size={16} className="fill-blue-500/20" />
                  <span>{t('diamonds')} ({t('recruit')})</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-normal">
                  {t('rulesDiamondsDesc')}
                </p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-900/40 p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Club size={16} className="fill-emerald-500/20" />
                  <span>{t('clubs')} ({t('doubleDmg')})</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-normal">
                  {t('rulesClubsDesc')}
                </p>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-3.5 rounded-xl space-y-1">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Shield size={16} className="fill-slate-400/20" />
                  <span>{t('spades')} ({t('shield')})</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-normal">
                  {t('rulesSpadesDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Immunity & Jokers */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
            <h4 className="font-bold text-purple-400 font-cinzel text-sm flex items-center gap-1.5">
              <Ban size={16} />
              <span>{t('rulesImmunityTitle')}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('rulesImmunityDesc')}
            </p>
          </div>

          {/* Combos & Aces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
              <h4 className="font-bold text-amber-400 font-cinzel text-sm">{t('rulesCombosTitle')}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('rulesCombosDesc')}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
              <h4 className="font-bold text-amber-400 font-cinzel text-sm">{t('rulesAcesTitle')}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('rulesAcesDesc')}
              </p>
            </div>
          </div>

          {/* Perfect Execution vs Overkill */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
            <h4 className="font-bold text-emerald-400 font-cinzel text-sm flex items-center gap-1.5">
              <Flame size={16} />
              <span>{t('rulesExecutionTitle')}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('rulesExecutionDesc')}
            </p>
          </div>

          {/* Enduring Damage & Passing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
              <h4 className="font-bold text-rose-400 font-cinzel text-sm flex items-center gap-1.5">
                <ShieldAlert size={16} />
                <span>{t('rulesCounterTitle')}</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('rulesCounterDesc')}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
              <h4 className="font-bold text-slate-300 font-cinzel text-sm flex items-center gap-1.5">
                <FastForward size={16} />
                <span>{t('rulesPassingTitle')}</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('rulesPassingDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-6 py-2.5 rounded-xl border border-slate-700 text-sm transition-all"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
