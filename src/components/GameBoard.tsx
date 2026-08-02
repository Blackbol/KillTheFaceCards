// 📁 src/components/GameBoard.tsx

import React, { useState } from 'react';
import { GameState } from '../types/game';
import { EnemyCardView } from './EnemyCardView';
import { CardView } from './CardView';
import { useI18n } from '../i18n/I18nContext';
import { Layers, ScrollText, Users, ChevronDown, ChevronUp, Swords, Crown } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  activePlayerId: string;
}

const PLAYED_CARDS_OPEN_KEY = 'killthefacecards_played_cards_open';
const BATTLE_LOG_OPEN_KEY = 'killthefacecards_battle_log_open';

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, activePlayerId }) => {
  const { t } = useI18n();

  // Collapsible states defaulted to FALSE (collapsed) by default, with localStorage persistence
  const [isPlayedCardsExpanded, setIsPlayedCardsExpandedState] = useState<boolean>(() => {
    return localStorage.getItem(PLAYED_CARDS_OPEN_KEY) === 'true';
  });

  const [isLogExpanded, setIsLogExpandedState] = useState<boolean>(() => {
    return localStorage.getItem(BATTLE_LOG_OPEN_KEY) === 'true';
  });

  const setIsPlayedCardsExpanded = (open: boolean) => {
    setIsPlayedCardsExpandedState(open);
    localStorage.setItem(PLAYED_CARDS_OPEN_KEY, String(open));
  };

  const setIsLogExpanded = (open: boolean) => {
    setIsLogExpandedState(open);
    localStorage.setItem(BATTLE_LOG_OPEN_KEY, String(open));
  };

  const currentTurnPlayer = gameState.players.find((p) => p.id === gameState.currentTurnPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === activePlayerId;

  /**
   * Helper to format structured JSON log entry or plain text fallback.
   */
  const formatLog = (rawLog: string): string => {
    if (rawLog.startsWith('{') && rawLog.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawLog);
        const params: Record<string, any> = { ...parsed.params };

        if (params.suit) {
          const suitKey = String(params.suit).toLowerCase();
          params.suit = t(suitKey as any) || params.suit;
        }
        if (params.rank) {
          const rankKey = String(params.rank).toLowerCase();
          params.rank = t(rankKey as any) || params.rank;
        }

        return t(parsed.key as any, params);
      } catch {
        return rawLog;
      }
    }
    return rawLog;
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-2 md:gap-3 p-1 sm:p-3 shrink-0">
      {/* Top Bar: Room Code & Players List */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/80 border border-slate-800 rounded-xl md:rounded-2xl p-2 sm:p-2.5 shadow-md backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl text-amber-400 font-cinzel font-black tracking-widest text-xs sm:text-sm">
            {t('room')}: {gameState.roomId}
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-lg">
            {gameState.mode === 'SOLO' ? t('solo') : t('multiplayer')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Users size={14} className="text-slate-500 shrink-0" />
          {gameState.players.map((player) => {
            const isTurn = player.id === gameState.currentTurnPlayerId;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold transition-all shrink-0 ${
                  isTurn
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                {player.isHost && (
                  <span title={t('hostBadge')}>
                    <Crown size={12} className="text-amber-400 shrink-0" />
                  </span>
                )}
                <span>{player.name}</span>
                <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-300 px-1 py-0.1 rounded-full">
                  {player.hand.length} {player.hand.length === 1 ? t('cardSingular') : t('cardPlural')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Playing Field Grid: 3 columns on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
        {/* Decks Column */}
        <div className="flex flex-row md:flex-col gap-1.5 items-center justify-between md:justify-start order-2 md:order-1 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 w-full shadow-md">
            <div className="w-7 h-8 sm:w-10 sm:h-12 rounded-lg border-2 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center font-cinzel font-bold text-amber-400 text-xs sm:text-sm shadow shrink-0">
              T
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('tavernDeck')}</div>
              <div className="text-xs sm:text-base font-extrabold text-slate-100 font-cinzel truncate">
                {gameState.tavernDeck.length} {gameState.tavernDeck.length === 1 ? t('cardSingular') : t('cardPlural')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 w-full shadow-md">
            <div className="w-7 h-8 sm:w-10 sm:h-12 rounded-lg border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center font-cinzel font-bold text-slate-500 text-xs sm:text-sm shadow shrink-0">
              D
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('discardPile')}</div>
              <div className="text-xs sm:text-base font-extrabold text-slate-100 font-cinzel truncate">
                {gameState.discardPile.length} {gameState.discardPile.length === 1 ? t('cardSingular') : t('cardPlural')}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-semibold bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-xl w-full">
            <Layers size={14} className="text-amber-500 shrink-0" />
            <span>{t('castleDeckRemaining', { count: gameState.castleDeck.length })}</span>
          </div>
        </div>

        {/* Center Enemy Display */}
        <div className="flex flex-col items-center justify-center order-1 md:order-2 shrink-0">
          <EnemyCardView enemy={gameState.currentEnemy} />
          
          <div className="mt-1 sm:mt-2 text-center">
            <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider uppercase border shadow-md ${
              isMyTurn
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}>
              {isMyTurn ? t('yourTurn') : t('playerTurn', { name: currentTurnPlayer?.name || 'Player' })}
            </span>
          </div>
        </div>

        {/* Played Cards & Battle Log Column */}
        <div className="flex flex-col gap-2 order-3 shrink-0">
          {/* Collapsible Played Cards Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-md">
            <div
              className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer"
              onClick={() => setIsPlayedCardsExpanded(!isPlayedCardsExpanded)}
            >
              <div className="flex items-center gap-1.5">
                <Swords size={13} className="text-amber-400" />
                <span>{t('cardsPlayed')} ({gameState.playedCards.length})</span>
              </div>
              <button type="button" className="text-amber-400 font-semibold text-[10px] flex items-center gap-0.5">
                {isPlayedCardsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {isPlayedCardsExpanded && (
              <div className="border-t border-slate-800/80 pt-2 pb-1 flex items-center justify-center">
                {gameState.playedCards.length === 0 ? (
                  <div className="text-center text-[10px] sm:text-xs text-slate-500 italic py-1">{t('noCardsPlayed')}</div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto max-h-24 no-scrollbar py-1 px-1">
                    {gameState.playedCards.map((card) => (
                      <CardView key={card.id} card={card} compact disabled />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapsible Battle Log Box (Most Recent Log at Top) */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-md">
            <div
              className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer"
              onClick={() => setIsLogExpanded(!isLogExpanded)}
            >
              <div className="flex items-center gap-1.5">
                <ScrollText size={13} className="text-amber-400" />
                <span>{t('battleLog')}</span>
              </div>
              <button type="button" className="text-amber-400 font-semibold text-[10px] flex items-center gap-0.5">
                {isLogExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {isLogExpanded && (
              <div className="flex flex-col gap-1 text-[10px] sm:text-xs text-slate-300 font-mono border-t border-slate-800/80 pt-1.5 max-h-28 sm:max-h-36 overflow-y-auto no-scrollbar">
                {[...gameState.lastActionLog].reverse().slice(0, 30).map((rawLog, idx) => (
                  <div key={idx} className="border-l-2 border-amber-500/40 pl-2 py-0.5 leading-tight">
                    {formatLog(rawLog)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
