// 📁 src/App.tsx

import { useState } from 'react';
import { useGameRoom } from './hooks/useGameRoom';
import { GameBoard } from './components/GameBoard';
import { HandView } from './components/HandView';
import { ActionControls } from './components/ActionControls';
import { LobbyModal } from './components/LobbyModal';
import { MultiplayerLobbyView } from './components/MultiplayerLobbyView';
import { VictoryGameOverModal } from './components/VictoryGameOverModal';
import { SaveGameModal } from './components/SaveGameModal';
import { JokerPlayerModal } from './components/JokerPlayerModal';
import { PauseModal } from './components/PauseModal';
import { RulesModal } from './components/RulesModal';
import { Footer } from './components/Footer';
import { LanguageToggle } from './components/LanguageToggle';
import { useI18n } from './i18n/I18nContext';
import { saveSoloGame, clearSavedSoloGame } from './utils/saveGame';
import { Crown, LogOut, AlertCircle, BookOpen, Pause } from 'lucide-react';

export function App() {
  const { t } = useI18n();
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  const {
    gameState,
    playerId,
    selectedCardIds,
    errorMessage,
    isLoading,
    createGame,
    joinGame,
    resumeSavedGame,
    toggleCardSelection,
    clearSelection,
    playSelectedCards,
    discardSelectedForDamage,
    passTurn,
    useSoloJoker,
    selectNextPlayerAfterJoker,
    setTurnTimer,
    togglePauseGame,
    startGameFromLobby,
    resetToLobby,
  } = useGameRoom();

  const handleLeaveGameClick = () => {
    if (
      gameState &&
      gameState.mode === 'SOLO' &&
      gameState.status !== 'LOBBY' &&
      gameState.status !== 'VICTORY' &&
      gameState.status !== 'GAME_OVER'
    ) {
      setIsSaveModalOpen(true);
    } else {
      resetToLobby();
    }
  };

  const handleSaveAndQuit = () => {
    if (gameState) {
      saveSoloGame(gameState);
    }
    setIsSaveModalOpen(false);
    resetToLobby();
  };

  const handleQuitWithoutSave = () => {
    if (gameState && gameState.players[0]) {
      clearSavedSoloGame(gameState.players[0].name);
    }
    setIsSaveModalOpen(false);
    resetToLobby();
  };

  const activePlayer = gameState?.players.find((p) => p.id === playerId);
  const isHost = activePlayer?.isHost ?? false;
  const showGameScreen = gameState && gameState.status !== 'LOBBY';
  const showMultiplayerLobby = gameState && gameState.mode === 'MULTIPLAYER' && gameState.status === 'LOBBY';

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-screen overflow-hidden flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans touch-none">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-900 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-3 py-1.5 sm:px-4 sm:py-2 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLeaveGameClick}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown size={18} />
            </div>
            <span className="font-cinzel font-black text-amber-400 tracking-wider text-sm sm:text-base">
              {t('appTitle')}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Host Pause Button (Multiplayer in active game) */}
            {showGameScreen && gameState.mode === 'MULTIPLAYER' && isHost && (
              <button
                type="button"
                onClick={togglePauseGame}
                className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-xl transition-all font-semibold shadow-sm"
              >
                <Pause size={13} />
                <span>{t('pauseGame')}</span>
              </button>
            )}

            {/* Rules Quick Reference Button */}
            <button
              type="button"
              onClick={() => setIsRulesOpen(true)}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl transition-all font-semibold shadow-sm"
            >
              <BookOpen size={13} />
              <span>{t('rulesQuickRef')}</span>
            </button>

            <LanguageToggle />

            {(showGameScreen || showMultiplayerLobby) && (
              <button
                type="button"
                onClick={handleLeaveGameClick}
                className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl transition-colors font-medium"
              >
                <LogOut size={13} />
                <span>{t('leaveGame')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-between p-1.5 sm:p-3 overflow-hidden min-h-0 pb-16 md:pb-1">
        {errorMessage && showGameScreen && (
          <div className="w-full max-w-xl mb-1 bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-2 shadow-lg animate-fadeIn shrink-0 z-20">
            <AlertCircle size={15} className="shrink-0" />
            <span>{t(errorMessage as any) || errorMessage}</span>
          </div>
        )}

        {!gameState ? (
          <div className="my-auto w-full flex justify-center overflow-y-auto no-scrollbar">
            <LobbyModal
              onCreateGame={createGame}
              onJoinGame={joinGame}
              onResumeGame={resumeSavedGame}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          </div>
        ) : showMultiplayerLobby ? (
          <div className="my-auto w-full flex justify-center overflow-y-auto no-scrollbar">
            <MultiplayerLobbyView
              gameState={gameState}
              activePlayerId={playerId}
              onSetTurnTimer={setTurnTimer}
              onStartGame={startGameFromLobby}
            />
          </div>
        ) : (
          <div className="w-full max-w-6xl flex-1 flex flex-col justify-between items-center gap-1 min-h-0 overflow-hidden">
            <GameBoard gameState={gameState} activePlayerId={playerId} />

            {activePlayer && (
              <HandView
                hand={activePlayer.hand}
                selectedCardIds={selectedCardIds}
                onToggleSelect={toggleCardSelection}
                currentEnemy={gameState.currentEnemy}
                gameState={gameState}
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

      {/* End Game Modal */}
      {gameState && (
        <VictoryGameOverModal gameState={gameState} onReset={resetToLobby} />
      )}

      {/* Save Game Confirmation Modal */}
      <SaveGameModal
        isOpen={isSaveModalOpen}
        onSaveAndQuit={handleSaveAndQuit}
        onQuitWithoutSave={handleQuitWithoutSave}
        onCancel={() => setIsSaveModalOpen(false)}
      />

      {/* Joker Yield Player Picker Modal */}
      <JokerPlayerModal
        gameState={gameState}
        activePlayerId={playerId}
        onSelectPlayer={selectNextPlayerAfterJoker}
      />

      {/* Full-Screen Pause Modal */}
      <PauseModal
        gameState={gameState}
        activePlayerId={playerId}
        onTogglePause={togglePauseGame}
      />

      {/* Rules Reference Drawer / Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Footer ALWAYS Visible */}
      <Footer compact={Boolean(showGameScreen || showMultiplayerLobby)} />
    </div>
  );
}
