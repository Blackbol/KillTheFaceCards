// 📁 src/App.tsx

import { useState, useEffect, useRef } from 'react';
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
import { RegicideEngine } from './engine/RegicideEngine';
import { pushGameState, getDatabaseInstance } from './services/firebase';
import { ref, remove } from 'firebase/database';
import { debugWarn } from './utils/debug';
import { Crown, LogOut, AlertCircle, BookOpen, Pause, Clock } from 'lucide-react';

export function App() {
  const { t } = useI18n();
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);

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
    kickPlayer,
    rematchInRoom,
    leaveGame,
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
      leaveGame();
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

  // Refs to prevent stale closure in interval
  const gameStateRef = useRef(gameState);
  const playerIdRef = useRef(playerId);
  gameStateRef.current = gameState;
  playerIdRef.current = playerId;

  // 30-second disconnect timeout handler effect synchronized with Firebase presence timestamp
  useEffect(() => {
    if (
      !gameState ||
      gameState.mode !== 'MULTIPLAYER' ||
      gameState.status === 'LOBBY' ||
      !gameState.isPaused
    ) {
      return;
    }

    const discPlayer = gameState.players.find((p) => p.isConnected === false);
    if (!discPlayer) return;

    const interval = setInterval(() => {
      const discTime = discPlayer.disconnectedAt || Date.now();
      const elapsedSec = Math.floor((Date.now() - discTime) / 1000);

      if (elapsedSec >= 30) {
        clearInterval(interval);

        if (discPlayer.isHost) {
          debugWarn('TIMEOUT', `Host ${discPlayer.name} exceeded 30s disconnect timeout -> removing room!`);
          const db = getDatabaseInstance();
          if (db && gameState.roomId) {
            remove(ref(db, `rooms/${gameState.roomId.toUpperCase()}`));
          }
        } else {
          debugWarn('TIMEOUT', `Player ${discPlayer.name} exceeded 30s disconnect timeout -> removing player.`);
          const { nextState } = RegicideEngine.leavePlayerFromRoom(gameState, discPlayer.id);
          nextState.isPaused = false;
          if (nextState.lastActionLog.length > 0) {
            nextState.lastActionLog.pop();
          }
          nextState.lastActionLog.push(
            JSON.stringify({
              key: 'logPlayerDisconnectedTimeout',
              params: { name: discPlayer.name }
            })
          );
          if (gameState.roomId) {
            pushGameState(gameState.roomId, nextState);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.isPaused, gameState?.status, gameState?.players]);

  // Real-time turn timer countdown logic for active turn player
  useEffect(() => {
    const currentGS = gameStateRef.current;
    const currentPId = playerIdRef.current;

    if (
      !currentGS ||
      currentGS.mode !== 'MULTIPLAYER' ||
      !currentGS.turnTimer?.enabled ||
      !currentGS.turnTimer.seconds ||
      currentGS.isPaused ||
      currentGS.status === 'LOBBY' ||
      currentGS.status === 'VICTORY' ||
      currentGS.status === 'GAME_OVER'
    ) {
      setTimerSecondsLeft(null);
      return;
    }

    const isMyTurn = currentGS.currentTurnPlayerId === currentPId;
    if (!isMyTurn) {
      setTimerSecondsLeft(null);
      return;
    }

    const initialSec = currentGS.turnTimer.seconds;
    setTimerSecondsLeft(initialSec);

    const interval = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);

          const stateNow = gameStateRef.current;
          const pIdNow = playerIdRef.current;
          if (stateNow && pIdNow) {
            const playerNow = stateNow.players.find((p) => p.id === pIdNow);
            if (playerNow && playerNow.hand.length > 0) {
              if (stateNow.status === 'DISCARD_DAMAGE') {
                const randomCard = playerNow.hand[Math.floor(Math.random() * playerNow.hand.length)];
                const result = RegicideEngine.discardForDamage(stateNow, pIdNow, [randomCard.id]);
                if (result.success) {
                  const cardsDesc = randomCard.rank;
                  result.nextState.lastActionLog.pop();
                  result.nextState.lastActionLog.push(
                    JSON.stringify({
                      key: 'logDiscardedTimer',
                      params: { name: playerNow.name, cards: cardsDesc, value: randomCard.value }
                    })
                  );
                  pushGameState(stateNow.roomId, result.nextState);
                }
              } else if (stateNow.status === 'PLAY_CARD') {
                const isPassAllowed =
                  stateNow.players.length === 1 ||
                  stateNow.consecutivePassCount < stateNow.players.length - 1;

                if (isPassAllowed) {
                  passTurn(true);
                } else {
                  const randomCard = playerNow.hand[Math.floor(Math.random() * playerNow.hand.length)];
                  const result = RegicideEngine.playTurn(stateNow, pIdNow, [randomCard]);
                  if (result.success) {
                    const cardsDesc = randomCard.rank;
                    const dmg = randomCard.value * (randomCard.suit === 'CLUBS' ? 2 : 1);
                    const lastLog = result.nextState.lastActionLog[result.nextState.lastActionLog.length - 1];
                    if (lastLog && lastLog.includes('logPlayerPlayed')) {
                      result.nextState.lastActionLog.pop();
                      result.nextState.lastActionLog.push(
                        JSON.stringify({
                          key: 'logPlayerPlayedTimer',
                          params: { name: playerNow.name, cards: cardsDesc, damage: dmg }
                        })
                      );
                    }
                    pushGameState(stateNow.roomId, result.nextState);
                  }
                }
              }
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameState?.currentTurnPlayerId,
    gameState?.status,
    gameState?.updatedAt,
    gameState?.turnTimer?.seconds,
    gameState?.isPaused,
    playerId,
  ]);

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
            {/* Active Turn Timer Badge */}
            {timerSecondsLeft !== null && (
              <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-600/80 text-rose-300 px-2 py-0.5 rounded-xl font-mono font-bold text-xs shadow animate-pulse">
                <Clock size={13} className="text-rose-400" />
                <span>{timerSecondsLeft}s</span>
              </div>
            )}

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
      <main className="flex-1 flex flex-col items-center justify-between p-1 sm:p-3 overflow-hidden min-h-0">
        {errorMessage && (
          <div className="w-full max-w-xl mb-1 bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center justify-between shadow-lg animate-fadeIn shrink-0 z-20">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{t(errorMessage as any) || errorMessage}</span>
            </div>
          </div>
        )}

        {!gameState ? (
          <div className="my-auto w-full flex justify-center overflow-y-auto no-scrollbar">
            <LobbyModal
              onCreateGame={createGame}
              onJoinGame={joinGame}
              onResumeGame={resumeSavedGame}
              isLoading={isLoading}
            />
          </div>
        ) : showMultiplayerLobby ? (
          <div className="my-auto w-full flex justify-center overflow-y-auto no-scrollbar">
            <MultiplayerLobbyView
              gameState={gameState}
              activePlayerId={playerId}
              onSetTurnTimer={setTurnTimer}
              onStartGame={startGameFromLobby}
              onKickPlayer={kickPlayer}
            />
          </div>
        ) : (
          <div className="w-full max-w-6xl flex-1 flex flex-col justify-between items-center gap-1.5 min-h-0 overflow-hidden">
            {/* Scrollable GameBoard Playing Field (Top/Middle section) */}
            <div className="w-full flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-center justify-start">
              <GameBoard gameState={gameState} activePlayerId={playerId} />
            </div>

            {/* Always Visible Player Interactive Controls Section (Bottom section) */}
            <div className="w-full shrink-0 flex flex-col items-center gap-1.5 z-20">
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
          </div>
        )}
      </main>

      {/* End Game Modal */}
      {gameState && (
        <VictoryGameOverModal
          gameState={gameState}
          activePlayerId={playerId}
          onReset={leaveGame}
          onRematch={rematchInRoom}
        />
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
