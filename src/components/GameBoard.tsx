// 📁 src/components/GameBoard.tsx

import React from 'react';
import { GameState } from '../types/game';
import { EnemyCardView } from './EnemyCardView';
import { CardView } from './CardView';
import { useI18n } from '../i18n/I18nContext';
import { Layers, ScrollText, Users } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  activePlayerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, activePlayerId }) => {
  const { t } = useI18n();
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

        // Translate suit or rank if present in params
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
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-4">
      {/* Top Bar: Room Code & Players List */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-amber-400 font-cinzel font-black tracking-widest text-lg">
            {t('room')}: {gameState.roomId}
          </div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-800 px-2.5 py-1 rounded-lg">
            {gameState.mode === 'SOLO' ? t('solo') : t('multiplayer')}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Users size={16} className="text-slate-500" />
          {gameState.players.map((player) => {
            const isTurn = player.id === gameState.currentTurnPlayerId;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold transition-all ${
                  isTurn
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <span>{player.name}</span>
                <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-1.5 py-0.2 rounded-full">
                  {player.hand.length} {player.hand.length === 1 ? t('cardSingular') : t('cardPlural')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Table Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col gap-4 items-center md:items-start order-2 md:order-1">
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 w-full max-w-xs shadow-md">
            <div className="w-12 h-16 rounded-lg border-2 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center font-cinzel font-bold text-amber-400 text-lg shadow">
              T
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('tavernDeck')}</div>
              <div className="text-xl font-extrabold text-slate-100 font-cinzel">
                {gameState.tavernDeck.length} {gameState.tavernDeck.length === 1 ? t('cardSingular') : t('cardPlural')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 w-full max-w-xs shadow-md">
            <div className="w-12 h-16 rounded-lg border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center font-cinzel font-bold text-slate-500 text-lg shadow">
              D
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('discardPile')}</div>
              <div className="text-xl font-extrabold text-slate-100 font-cinzel">
                {gameState.discardPile.length} {gameState.discardPile.length === 1 ? t('cardSingular') : t('cardPlural')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold bg-slate-900/60 border border-slate-800/80 px-3 py-2 rounded-xl w-full max-w-xs">
            <Layers size={16} className="text-amber-500" />
            <span>{t('castleDeckRemaining', { count: gameState.castleDeck.length })}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center order-1 md:order-2">
          <EnemyCardView enemy={gameState.currentEnemy} />
          
          <div className="mt-4 text-center">
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border shadow-md ${
              isMyTurn
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}>
              {isMyTurn ? t('yourTurn') : t('playerTurn', { name: currentTurnPlayer?.name || 'Player' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 order-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 min-h-[160px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('cardsPlayed')}</span>
            {gameState.playedCards.length === 0 ? (
              <div className="my-auto text-center text-xs text-slate-500 italic">{t('noCardsPlayed')}</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {gameState.playedCards.map((card) => (
                  <CardView key={card.id} card={card} compact disabled />
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              <ScrollText size={14} className="text-amber-400" />
              <span>{t('battleLog')}</span>
            </div>
            <div className="flex flex-col gap-1 text-xs text-slate-300 font-mono">
              {gameState.lastActionLog.slice(-5).map((rawLog, idx) => (
                <div key={idx} className="border-l-2 border-amber-500/40 pl-2 py-0.5">
                  {formatLog(rawLog)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
