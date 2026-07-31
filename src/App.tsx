// 📁 src/App.tsx

import { useGameRoom } from './hooks/useGameRoom';
import { GameBoard } from './components/GameBoard';
import { HandView } from './components/HandView';
import { ActionControls } from './components/ActionControls';
import { LobbyModal } from './components/LobbyModal';
import { VictoryGameOverModal } from './components/VictoryGameOverModal';
import { Footer } from './components/Footer';
import { LanguageToggle } from './components/LanguageToggle';
import { useI18n } from './i18n/I18nContext';
import { Crown, LogOut, AlertCircle } from 'lucide-react';

export function App() {
  const { t } = useI18n();
  const {
    gameState,
    playerId,
    selectedCardIds,
    errorMessage,
    isLoading,
    createGame,
    joinGame,
    toggleCardSelection,
    clearSelection,
    playSelectedCards,
    discardSelectedForDamage,
    passTurn,
    useSoloJoker,
    selectNextPlayerAfterJoker,
    resetToLobby,
  } = useGameRoom();

  const activePlayer = gameState?.players.find((p) => p.id === playerId);
  const showGameScreen = gameState && gameState.status !== 'LOBBY';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetToLobby}>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown size={20} />
            </div>
            <span className="font-cinzel font-black text-amber-400 tracking-wider text-lg">
              {t('appTitle')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            {showGameScreen && (
              <button
                type="button"
                onClick={resetToLobby}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors font-medium"
              >
                <LogOut size={14} />
                <span>{t('leaveGame')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {errorMessage && showGameScreen && (
          <div className="w-full max-w-xl mb-4 bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg animate-fadeIn">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!showGameScreen ? (
          <LobbyModal
            onCreateGame={createGame}
            onJoinGame={joinGame}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        ) : (
          <div className="w-full max-w-6xl flex flex-col gap-6 items-center">
            <GameBoard gameState={gameState} activePlayerId={playerId} />

            {activePlayer && (
              <HandView
                hand={activePlayer.hand}
                selectedCardIds={selectedCardIds}
                onToggleSelect={toggleCardSelection}
                currentEnemy={gameState.currentEnemy}
                disabled={gameState.currentTurnPlayerId !== playerId && gameState.status !== 'YIELD_JOKER_CHOICE'}
              />
            )}

            <ActionControls
              gameState={gameState}
              activePlayerId={playerId}
              selectedCardIds={selectedCardIds}
              onPlayCards={playSelectedCards}
              onDiscardForDamage={discardSelectedForDamage}
              onPassTurn={passTurn}
              onUseSoloJoker={useSoloJoker}
              onSelectJokerPlayer={selectNextPlayerAfterJoker}
              onClearSelection={clearSelection}
            />
          </div>
        )}
      </main>

      {gameState && (
        <VictoryGameOverModal gameState={gameState} onReset={resetToLobby} />
      )}

      <Footer />
    </div>
  );
}
