// 📁 src/components/SaveGameModal.tsx

import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Save, LogOut, X } from 'lucide-react';

interface SaveGameModalProps {
  isOpen: boolean;
  onSaveAndQuit: () => void;
  onQuitWithoutSave: () => void;
  onCancel: () => void;
}

export const SaveGameModal: React.FC<SaveGameModalProps> = ({
  isOpen,
  onSaveAndQuit,
  onQuitWithoutSave,
  onCancel,
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-cinzel font-black text-base">
            <Save size={20} />
            <span>{t('saveGameTitle')}</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {t('saveGameDesc')}
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onSaveAndQuit}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>{t('saveAndQuit')}</span>
          </button>

          <button
            type="button"
            onClick={onQuitWithoutSave}
            className="w-full py-2.5 bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            <span>{t('quitWithoutSave')}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
