// 📁 src/hooks/useGameRoom.ts

import { useState, useEffect, useCallback } from 'react';
import { Card, GameMode, GameState } from '../types/game';
import { RegicideEngine } from '../engine/RegicideEngine';
import { clearSavedSoloGame } from '../utils/saveGame';
import {
  createRoom as createFirebaseRoom,
  joinRoom as joinFirebaseRoom,
  subscribeToRoom,
  pushGameState
} from '../services/firebase';

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
  passTurn: () => Promise<void>;
  useSoloJoker: () => Promise<void>;
  selectNextPlayerAfterJoker: (targetPlayerId: string) => Promise<void>;
  resetToLobby: () => void;
}

export function useGameRoom(): UseGameRoomReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Subscribe to Firebase RTDB changes when in MULTIPLAYER mode
  useEffect(() => {
    if (!gameState?.roomId || gameState.mode === 'SOLO') return;

    const unsubscribe = subscribeToRoom(gameState.roomId, (newState) => {
      if (newState) {
        setGameState(newState);
      }
    });

    return () => unsubscribe();
  }, [gameState?.roomId, gameState?.mode]);

  /**
   * Helper to persist game state update either locally (SOLO) or via Firebase (MULTIPLAYER).
   */
  const updateState = useCallback(async (newState: GameState) => {
    setGameState(newState);
    if (newState.status === 'VICTORY' || newState.status === 'GAME_OVER') {
      if (newState.mode === 'SOLO' && newState.players.length > 0) {
        clearSavedSoloGame(newState.players[0].name);
      }
    }
    if (newState.mode === 'MULTIPLAYER' && newState.roomId) {
      await pushGameState(newState.roomId, newState);
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
        setPlayerId(pId);
        setGameState(state);
      } else {
        const { playerId: pId, initialState } = await createFirebaseRoom(
          playerName || 'Host Commander',
          'MULTIPLAYER'
        );
        setPlayerId(pId);
        setGameState(initialState);
      }
    } catch (err: any) {
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
      if (result.success && result.playerId) {
        setPlayerId(result.playerId);
        return true;
      } else {
        setErrorMessage(result.error || 'Could not join room.');
        return false;
      }
    } catch (err: any) {
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
    setGameState(savedState);
    setPlayerId(savedState.players[0].id);
    setSelectedCardIds([]);
    setErrorMessage(null);
  }, []);

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

    const selectedCards: Card[] = currentPlayer.hand.filter((c) =>
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
  const passTurn = useCallback(async () => {
    if (!gameState || !playerId) return;

    const result = RegicideEngine.passTurn(gameState, playerId);
    if (result.success) {
      setSelectedCardIds([]);
      setErrorMessage(null);
      await updateState(result.nextState);
    } else {
      setErrorMessage(result.message);
    }
  }, [gameState, playerId, updateState]);

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
    resetToLobby,
  };
}
