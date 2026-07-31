// 📁 src/components/Footer.tsx

import React from 'react';
import { useI18n } from '../i18n/I18nContext';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-[11px] text-slate-500 space-y-1">
      <p>{t('legalFooter')}</p>
      <p>{t('regicideDesignBy')}</p>
      <p className="text-slate-600">{t('noOfficialArt')}</p>
    </footer>
  );
};
