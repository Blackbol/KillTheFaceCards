// 📁 src/components/LanguageToggle.tsx

import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold shadow-sm">
      <Globe size={14} className="text-slate-400 ml-1.5 mr-0.5" />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-0.5 rounded-lg transition-all ${
          language === 'en'
            ? 'bg-amber-500 text-slate-950 font-black shadow'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`px-2 py-0.5 rounded-lg transition-all ${
          language === 'fr'
            ? 'bg-amber-500 text-slate-950 font-black shadow'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        FR
      </button>
    </div>
  );
};
