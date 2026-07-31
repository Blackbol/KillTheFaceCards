// 📁 src/services/firebase.ts

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  remove,
  Database
} from 'firebase/database';
import { GameMode, GameState } from '../types/game';
import { RegicideEngine } from '../engine/RegicideEngine';

// Firebase configuration derived from environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase App & Realtime Database instance
const app = initializeApp(firebaseConfig);
export const database: Database = getDatabase(app);

/**
 * Generates a random 4-letter uppercase room code (e.g. "KNGS", "RGC1").
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a new multiplayer room in Firebase RTDB.
 */
export async function createRoom(
  hostName: string,
  mode: GameMode = 'MULTIPLAYER'
): Promise<{ roomId: string; playerId: string; initialState: GameState }> {
  const roomId = generateRoomCode();
  const hostId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const playerConfigs = [{ id: hostId, name: hostName, isHost: true }];
  const initialState = RegicideEngine.createNewGame(mode, playerConfigs, roomId);

  const roomRef = ref(database, `rooms/${roomId}`);
  await set(roomRef, initialState);

  return { roomId, playerId: hostId, initialState };
}

/**
 * Joins an existing multiplayer room by code.
 */
export async function joinRoom(
  roomId: string,
  playerName: string
): Promise<{ success: boolean; playerId?: string; error?: string }> {
  const cleanRoomId = roomId.trim().toUpperCase();
  const roomRef = ref(database, `rooms/${cleanRoomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    return { success: false, error: 'Room not found. Check code.' };
  }

  const state: GameState = snapshot.val();

  if (state.status !== 'LOBBY') {
    return { success: false, error: 'Game has already started in this room.' };
  }

  if (state.players.length >= 4) {
    return { success: false, error: 'Room is full (max 4 players).' };
  }

  const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const updatedPlayers = [
    ...state.players,
    { id: playerId, name: playerName, isHost: false, isConnected: true, hand: [] }
  ];

  // Re-initialize game state with updated player list to calculate correct hand distributions
  const updatedState = RegicideEngine.createNewGame(state.mode, updatedPlayers, cleanRoomId);
  await set(roomRef, updatedState);

  return { success: true, playerId };
}

/**
 * Subscribes to real-time updates for a room via Firebase RTDB onValue listener.
 */
export function subscribeToRoom(
  roomId: string,
  callback: (state: GameState | null) => void
): () => void {
  const roomRef = ref(database, `rooms/${roomId.toUpperCase()}`);

  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as GameState);
    } else {
      callback(null);
    }
  });

  return () => {
    off(roomRef, 'value', unsubscribe);
  };
}

/**
 * Updates game state in Firebase RTDB.
 */
export async function pushGameState(roomId: string, newState: GameState): Promise<void> {
  const roomRef = ref(database, `rooms/${roomId.toUpperCase()}`);
  await set(roomRef, newState);
}

/**
 * Clean up room if game is over or inactive > 3 hours.
 */
export async function cleanupRoomIfStale(roomId: string, state: GameState): Promise<void> {
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  const isStale = Date.now() - (state.updatedAt || state.createdAt) > THREE_HOURS_MS;
  const isFinished = state.status === 'VICTORY' || state.status === 'GAME_OVER';

  if (isStale || isFinished) {
    const roomRef = ref(database, `rooms/${roomId.toUpperCase()}`);
    await remove(roomRef);
  }
}
