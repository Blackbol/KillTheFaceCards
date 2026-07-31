// 📁 src/components/Footer.tsx

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-[11px] text-slate-500 space-y-1">
      <p>
        <strong className="text-slate-400 font-cinzel">Kill The Face Cards</strong> is a 100% free, fan-made web adaptation based on the mechanics of the cooperative card game <strong className="text-slate-400 font-cinzel">Regicide</strong>.
      </p>
      <p>
        Regicide original game design by Paul Abrahams, Luke Badger & Andy Richdale. Published by Badgers from Mars and Iello.
      </p>
      <p className="text-slate-600">
        No official trademarks or artwork used. Standard 54-card deck mechanics. 0 ads, 0 tracking.
      </p>
    </footer>
  );
};
