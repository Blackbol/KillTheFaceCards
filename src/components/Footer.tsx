// 📁 src/components/Footer.tsx

import React from 'react';
import { useI18n } from '../i18n/I18nContext';

interface FooterProps {
  compact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ compact = false }) => {
  const { t } = useI18n();

  if (compact) {
    return (
      <footer className="w-full border-t border-slate-900/80 bg-slate-950/95 py-1 px-3 text-[10px] text-slate-500 text-center shrink-0 z-10">
        <p className="max-w-5xl mx-auto leading-normal">
          {t('legalFooter')} • {t('noOfficialArt')}
        </p>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-2.5 px-4 text-xs text-slate-500 text-center space-y-1 shrink-0 z-10">
      <div className="max-w-4xl mx-auto space-y-0.5">
        <p>{t('legalFooter')}</p>
        <p className="text-[11px] text-slate-600">{t('regicideDesignBy')}</p>
        <p className="text-[10px] text-slate-600">{t('noOfficialArt')}</p>
      </div>
    </footer>
  );
};
