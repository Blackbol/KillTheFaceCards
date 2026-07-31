// 📁 src/hooks/useGameRoom.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, GameMode, GameState } from '../types/game';
import { RegicideEngine } from '../engine/RegicideEngine';
import { clearSavedSoloGame } from '../utils/saveGame';
import { ref, get, remove } from 'firebase/database';
import {
  createRoom as createFirebaseRoom,
  joinRoom as joinFirebaseRoom,
  subscribeToRoom,
  pushGameState,
  registerPlayerPresence,
  getDatabaseInstance
} from '../services/firebase';
import { debugLog, debugWarn } from '../utils/debug';

export interface UseGameRoomReturn {
  gameState: GameState | null;
  playerId: string;
  selectedCardIds: string[];
  errorMessage: string | null;
  isLoading: boolean;
  createGame: (playerName: string, mode: GameMode) => Promise<void>;
  joinGame: (roomCode: string, playerName: string) => Promise<boolean>;
  resumeSavedGame: (savedState: GameState) => void;
  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;
  playSelectedCards: () => Promise<void>;
  discardSelectedForDamage: () => Promise<void>;
  passTurn: (isTimerAction?: boolean) => Promise<void>;
  useSoloJoker: () => Promise<void>;
  selectNextPlayerAfterJoker: (targetPlayerId: string) => Promise<void>;
  setTurnTimer: (seconds: number) => Promise<void>;
  togglePauseGame: () => Promise<void>;
  startGameFromLobby: () => Promise<void>;
  kickPlayer: (targetPlayerId: string) => Promise<void>;
  rematchInRoom: () => Promise<void>;
  leaveGame: () => Promise<void>;
  resetToLobby: () => void;
}

const ACTIVE_SESSION_KEY = 'killthefacecards_active_session';

/**
 * Ensures array properties stripped by Firebase RTDB are safely defaulted to empty arrays.
 */
export function sanitizeGameState(raw: GameState): GameState {
  if (!raw) return raw;
  return {
    ...raw,
    players: (raw.players || []).map((p) => ({ ...p, hand: p.hand || [] })),
    castleDeck: raw.castleDeck || [],
    tavernDeck: raw.tavernDeck || [],
    discardPile: raw.discardPile || [],
    playedCards: raw.playedCards || [],
    lastActionLog: raw.lastActionLog || [],
  };
}

export function useGameRoom(): UseGameRoomReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isUserInRoomRef = useRef<boolean>(false);
  const activePlayerIdRef = useRef<string>('');

  // Auto-reconnect to existing active multiplayer session on F5 page refresh
  useEffect(() => {
    const rawSaved = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!rawSaved) return;

    try {
      const saved = JSON.parse(rawSaved);
      if (saved.roomId && saved.playerId) {
        debugLog('RECONNECT', `Attempting auto-reconnect to room ${saved.roomId} for player ${saved.playerId}`);
        const db = getDatabaseInstance();
        if (!db) return;

        get(ref(db, `rooms/${saved.roomId.toUpperCase()}`)).then((snapshot) => {
          if (snapshot.exists()) {
            const rawState = snapshot.val() as GameState;
            if (rawState.players.some((p) => p.id === saved.playerId)) {
              isUserInRoomRef.current = true;
              activePlayerIdRef.current = saved.playerId;
              setPlayerId(saved.playerId);
              const cleanState = sanitizeGameState(rawState);
              const pIdx = cleanState.players.findIndex((p) => p.id === saved.playerId);
              if (pIdx !== -1) {
                cleanState.players[pIdx].isConnected = true;
              }
              setGameState(cleanState);
              pushGameState(saved.roomId, cleanState);
              debugLog('RECONNECT', `Successfully reconnected player ${saved.playerId} to room ${saved.roomId}`);
            } else {
              debugWarn('RECONNECT', `Player ${saved.playerId} not found in room ${saved.roomId}`);
              localStorage.removeItem(ACTIVE_SESSION_KEY);
            }
          } else {
            debugWarn('RECONNECT', `Room ${saved.roomId} no longer exists in database.`);
            localStorage.removeItem(ACTIVE_SESSION_KEY);
          }
        });
      }
    } catch (e) {
      debugWarn('RECONNECT', 'Failed to parse active session key:', e);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, []);

  // Register connection presence listener when in room
  useEffect(() => {
    if (!gameState?.roomId || !playerId || gameState.mode === 'SOLO') return;
    const cleanupPresence = registerPlayerPresence(gameState.roomId, playerId);
    return () => cleanupPresence();
  }, [gameState?.roomId, playerId, gameState?.mode]);

  // Subscribe to Firebase RTDB changes when in MULTIPLAYER mode
  useEffect(() => {
    if (!gameState?.roomId || gameState.mode === 'SOLO') return;

    const unsubscribe = subscribeToRoom(gameState.roomId, (newState) => {
      if (!isUserInRoomRef.current) return;

      if (!newState) {
        debugWarn('ROOM', 'Room was deleted or closed by host.');
        isUserInRoomRef.current = false;
        activePlayerIdRef.current = '';
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        setGameState(null);
        setPlayerId('');
        setSelectedCardIds([]);
        setErrorMessage('errHostClosedRoom');
        return;
      }

      const cleanState = sanitizeGameState(newState);
      const targetPId = activePlayerIdRef.current || playerId;
      if (targetPId && !cleanState.players.some((p) => p.id === targetPId)) {
        debugWarn('ROOM', `Player ${targetPId} was kicked or removed from room.`);
        isUserInRoomRef.current = false;
        activePlayerIdRef.current = '';
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        setGameState(null);
        setPlayerId('');
        setSelectedCardIds([]);
        setErrorMessage('errKickedFromRoom');
        return;
      }
      setGameState(cleanState);
    });

    return () => unsubscribe();
  }, [gameState?.roomId, gameState?.mode, playerId]);

  /**
   * Helper to persist game state update either locally (SOLO) or via Firebase (MULTIPLAYER).
   */
  const updateState = useCallback(async (newState: GameState) => {
    const cleanState = sanitizeGameState(newState);
    setGameState(cleanState);
    if (cleanState.status === 'VICTORY' || cleanState.status === 'GAME_OVER') {
      if (cleanState.mode === 'SOLO' && cleanState.players.length > 0) {
        clearSavedSoloGame(cleanState.players[0].name);
      }
    }
    if (cleanState.mode === 'MULTIPLAYER' && cleanState.roomId) {
      await pushGameState(cleanState.roomId, cleanState);
    }
  }, []);

  /**
   * Initiates a new game (Solo or Multiplayer Host).
   */
  const createGame = useCallback(async (playerName: string, mode: GameMode) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (mode === 'SOLO') {
        const pId = `player-solo-${Date.now()}`;
        const state = RegicideEngine.createNewGame(
          'SOLO',
          [{ id: pId, name: playerName || 'Hero', isHost: true }],
          'SOLO'
        );
        isUserInRoomRef.current = false;
        activePlayerIdRef.current = pId;
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        setPlayerId(pId);
        setGameState(sanitizeGameState(state));
        debugLog('GAME', 'Created solo game session.');
      } else {
        const { playerId: pId, initialState } = await createFirebaseRoom(
          playerName || 'Host Commander',
          'MULTIPLAYER'
        );
        isUserInRoomRef.current = true;
        activePlayerIdRef.current = pId;
        localStorage.setItem(
          ACTIVE_SESSION_KEY,
          JSON.stringify({ roomId: initialState.roomId, playerId: pId })
        );
        setPlayerId(pId);
        setGameState(sanitizeGameState(initialState));
        debugLog('GAME', `Created multiplayer host room ${initialState.roomId} with player ${pId}`);
      }
    } catch (err: any) {
      debugWarn('GAME', 'Create game error:', err);
      setErrorMessage(err.message || 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Joins an existing Multiplayer room code.
   */
  const joinGame = useCallback(async (roomCode: string, playerName: string): Promise<boolean> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await joinFirebaseRoom(roomCode, playerName || 'Challenger');
      if (result.success && result.playerId && result.joinedState) {
        isUserInRoomRef.current = true;
        activePlayerIdRef.current = result.playerId; // Synchronous ref update prevents kicked closure race!
        localStorage.setItem(
          ACTIVE_SESSION_KEY,
          JSON.stringify({ roomId: result.joinedState.roomId, playerId: result.playerId })
        );
        setPlayerId(result.playerId);
        setGameState(sanitizeGameState(result.joinedState));
        debugLog('GAME', `Successfully joined room ${roomCode} with player ${result.playerId}`);
        return true;
      } else {
        debugWarn('GAME', `Failed to join room ${roomCode}:`, result.error);
        setErrorMessage(result.error || 'Could not join room.');
        return false;
      }
    } catch (err: any) {
      debugWarn('GAME', 'Join game exception:', err);
      setErrorMessage(err.message || 'Failed to join room.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Resumes a previously saved game state.
   */
  const resumeSavedGame = useCallback((savedState: GameState) => {
    if (!savedState || savedState.players.length === 0) return;
    isUserInRoomRef.current = false;
    activePlayerIdRef.current = savedState.players[0].id;
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setGameState(sanitizeGameState(savedState));
    setPlayerId(savedState.players[0].id);
    setSelectedCardIds([]);
    setErrorMessage(null);
    debugLog('GAME', 'Resumed saved solo game state.');
  }, []);

  /**
   * Configures turn timer (Host only).
   */
  const setTurnTimer = useCallback(
    async (seconds: number) => {
      if (!gameState || !playerId) return;
      const result = RegicideEngine.setTurnTimer(gameState, playerId, seconds);
      if (result.success) {
        setErrorMessage(null);
        await updateState(result.nextState);
      } else {
        setErrorMessage(result.message);
      }
    },
    [gameState, playerId, updateState]
  );

  /**
   * Toggles game pause state (Host only).
   */
  const togglePauseGame = useCallback(async () => {
    if (!gameState || !playerId) return;
    const result = RegicideEngine.togglePauseGame(gameState, playerId);
    if (result.success) {
      setErrorMessage(null);
      await updateState(result.nextState);
    } else {
      setErrorMessage(result.message);
    }
  }, [gameState, playerId, updateState]);

  /**
   * Starts game from LOBBY status (Host only).
   */
  const startGameFromLobby = useCallback(async () => {
    if (!gameState || !playerId) return;
    const result = RegicideEngine.startGameFromLobby(gameState, playerId);
    if (result.success) {
      setErrorMessage(null);
      await updateState(result.nextState);
      debugLog('GAME', 'Host started game from lobby.');
    } else {
      setErrorMessage(result.message);
    }
  }, [gameState, playerId, updateState]);

  /**
   * Kicks a player from the lobby (Host only).
   */
  const kickPlayer = useCallback(
    async (targetPlayerId: string) => {
      if (!gameState || !playerId) return;
      const result = RegicideEngine.kickPlayerFromLobby(gameState, playerId, targetPlayerId);
      if (result.success) {
        setErrorMessage(null);
        await updateState(result.nextState);
        const db = getDatabaseInstance();
        if (db && gameState.roomId) {
          await remove(ref(db, `rooms/${gameState.roomId.toUpperCase()}/presence/${targetPlayerId}`));
        }
        debugLog('GAME', `Host kicked player ${targetPlayerId}`);
      } else {
        setErrorMessage(result.message);
      }
    },
    [gameState, playerId, updateState]
  );

  /**
   * Initiates a rematch for all players in room (Host only).
   */
  const rematchInRoom = useCallback(async () => {
    if (!gameState || !playerId) return;
    const result = RegicideEngine.rematchInRoom(gameState, playerId);
    if (result.success) {
      setErrorMessage(null);
      await updateState(result.nextState);
    } else {
      setErrorMessage(result.message);
    }
  }, [gameState, playerId, updateState]);

  /**
   * Gracefully leaves game room. If host leaves, closes room for all.
   */
  const leaveGame = useCallback(async () => {
    isUserInRoomRef.current = false;
    activePlayerIdRef.current = '';
    localStorage.removeItem(ACTIVE_SESSION_KEY);

    if (gameState && playerId && gameState.mode === 'MULTIPLAYER' && gameState.roomId) {
      const { isHostLeaving, nextState } = RegicideEngine.leavePlayerFromRoom(gameState, playerId);
      if (isHostLeaving) {
        debugLog('ROOM', `Host ${playerId} left -> closing room ${gameState.roomId}`);
        const db = getDatabaseInstance();
        if (db) {
          await remove(ref(db, `rooms/${gameState.roomId.toUpperCase()}`));
        }
      } else {
        debugLog('ROOM', `Player ${playerId} left room ${gameState.roomId}`);
        await pushGameState(gameState.roomId, nextState);
        const db = getDatabaseInstance();
        if (db) {
          await remove(ref(db, `rooms/${gameState.roomId.toUpperCase()}/presence/${playerId}`));
        }
      }
    }

    setGameState(null);
    setPlayerId('');
    setSelectedCardIds([]);
    setErrorMessage(null);
  }, [gameState, playerId]);

  /**
   * Toggles selection state of a card in hand.
   */
  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  }, []);

  /**
   * Clears card selections.
   */
  const clearSelection = useCallback(() => {
    setSelectedCardIds([]);
  }, []);

  /**
   * Plays the selected cards from hand against active enemy.
   */
  const playSelectedCards = useCallback(async () => {
    if (!gameState || !playerId) return;

    const currentPlayer = gameState.players.find((p) => p.id === playerId);
    if (!currentPlayer) return;

    const selectedCards: Card[] = (currentPlayer.hand || []).filter((c) =>
      selectedCardIds.includes(c.id)
    );

    const result = RegicideEngine.playTurn(gameState, playerId, selectedCards);
    if (result.success) {
      setSelectedCardIds([]);
      setErrorMessage(null);
      await updateState(result.nextState);
    } else {
      setErrorMessage(result.message);
    }
  }, [gameState, playerId, selectedCardIds, updateState]);

  /**
   * Submits selected cards to absorb pending counter-attack damage.
   */
  const discardSelectedForDamage = useCallback(async () => {
    if (!gameState || !playerId) return;

    const result = RegicideEngine.discardForDamage(gameState, playerId, selectedCardIds);
    if (result.success) {
      setSelectedCardIds([]);
      setErrorMessage(null);
      await updateState(result.nextState);
    } else {
      setErrorMessage(result.message);
    }
  }, [gameState, playerId, selectedCardIds, updateState]);

  /**
   * Passes turn to next player.
   */
  const passTurn = useCallback(
    async (isTimerAction = false) => {
      if (!gameState || !playerId) return;

      const result = RegicideEngine.passTurn(gameState, playerId, isTimerAction);
      if (result.success) {
        setSelectedCardIds([]);
        setErrorMessage(null);
        await updateState(result.nextState);
      } else {
        setErrorMessage(result.message);
      }
    },
    [gameState, playerId, updateState]
  );

  /**
   * Activates Solo Joker ability.
   */
  const useSoloJoker = useCallback(async () => {
    if (!gameState || !playerId) return;

    const result = RegicideEngine.useSoloJoker(gameState, playerId);
    if (result.success) {
      setSelectedCardIds([]);
      setErrorMessage(null);
      await updateState(result.nextState);
    } else {
      setErrorMessage(result.message);
    }
  }, [gameState, playerId, updateState]);

  /**
   * Selects next player after Joker play in Multiplayer.
   */
  const selectNextPlayerAfterJoker = useCallback(
    async (targetPlayerId: string) => {
      if (!gameState) return;

      const result = RegicideEngine.selectNextPlayerAfterJoker(gameState, targetPlayerId);
      if (result.success) {
        setErrorMessage(null);
        await updateState(result.nextState);
      } else {
        setErrorMessage(result.message);
      }
    },
    [gameState, updateState]
  );

  /**
   * Resets game state back to main menu.
   */
  const resetToLobby = useCallback(() => {
    isUserInRoomRef.current = false;
    activePlayerIdRef.current = '';
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setGameState(null);
    setPlayerId('');
    setSelectedCardIds([]);
    setErrorMessage(null);
  }, []);

  return {
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
  };
}
