// 📁 src/services/firebase.ts

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
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

// Firebase configuration loaded strictly from environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Database | null = null;

/**
 * Wraps a promise with a timeout limit (e.g. 5 seconds).
 */
function withTimeout<T>(promise: Promise<T>, ms = 5000, errorMsg = 'Firebase operation timed out.'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms)
    ),
  ]);
}

/**
 * Safely retrieves or initializes the Firebase Realtime Database instance.
 * Returns null if environment variables are not configured or contain placeholders.
 */
export function getDatabaseInstance(): Database | null {
  if (dbInstance) return dbInstance;

  // Check if databaseURL & apiKey are configured and not placeholders
  if (
    !firebaseConfig.databaseURL ||
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey.includes('your_') ||
    firebaseConfig.databaseURL.includes('your_')
  ) {
    console.info('[Firebase] No valid remote credentials found in environment. Running in offline mode.');
    return null;
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(firebaseConfig);
    } else {
      appInstance = getApps()[0];
    }
    dbInstance = getDatabase(appInstance);
    return dbInstance;
  } catch (error) {
    console.warn('[Firebase] Initialization error:', error);
    return null;
  }
}

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
  const db = getDatabaseInstance();
  if (!db) {
    throw new Error('errFirebaseUnavailable');
  }

  const roomId = generateRoomCode();
  const hostId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const playerConfigs = [{ id: hostId, name: hostName, isHost: true }];
  const initialState = RegicideEngine.createNewGame(mode, playerConfigs, roomId);

  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    await withTimeout(set(roomRef, initialState), 5000, 'errFirebaseUnavailable');
  } catch (err) {
    console.warn('[Firebase] Could not push room to remote database:', err);
    throw new Error('errFirebaseUnavailable');
  }

  return { roomId, playerId: hostId, initialState };
}

/**
 * Joins an existing multiplayer room by code.
 */
export async function joinRoom(
  roomId: string,
  playerName: string
): Promise<{ success: boolean; playerId?: string; error?: string }> {
  const db = getDatabaseInstance();
  if (!db) {
    return { success: false, error: 'errFirebaseUnavailable' };
  }

  try {
    const cleanRoomId = roomId.trim().toUpperCase();
    const roomRef = ref(db, `rooms/${cleanRoomId}`);
    const snapshot = await withTimeout(get(roomRef), 5000, 'errFirebaseUnavailable');

    if (!snapshot.exists()) {
      return { success: false, error: 'errRoomNotFound' };
    }

    const state: GameState = snapshot.val();

    if (state.status !== 'LOBBY') {
      return { success: false, error: 'errGameAlreadyStarted' };
    }

    if (state.players.length >= 4) {
      return { success: false, error: 'errRoomFull' };
    }

    const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const updatedPlayers = [
      ...state.players,
      { id: playerId, name: playerName, isHost: false, isConnected: true, hand: [] }
    ];

    const updatedState = RegicideEngine.createNewGame(state.mode, updatedPlayers, cleanRoomId);
    await withTimeout(set(roomRef, updatedState), 5000, 'errFirebaseUnavailable');

    return { success: true, playerId };
  } catch (err: any) {
    return { success: false, error: err.message || 'errFirebaseUnavailable' };
  }
}

/**
 * Subscribes to real-time updates for a room via Firebase RTDB onValue listener.
 */
export function subscribeToRoom(
  roomId: string,
  callback: (state: GameState | null) => void
): () => void {
  const db = getDatabaseInstance();
  if (!db) return () => {};

  const roomRef = ref(db, `rooms/${roomId.toUpperCase()}`);

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
  const db = getDatabaseInstance();
  if (!db) return;

  const roomRef = ref(db, `rooms/${roomId.toUpperCase()}`);
  await set(roomRef, newState);
}

/**
 * Clean up room if game is over or inactive > 3 hours.
 */
export async function cleanupRoomIfStale(roomId: string, state: GameState): Promise<void> {
  const db = getDatabaseInstance();
  if (!db) return;

  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  const isStale = Date.now() - (state.updatedAt || state.createdAt) > THREE_HOURS_MS;
  const isFinished = state.status === 'VICTORY' || state.status === 'GAME_OVER';

  if (isStale || isFinished) {
    const roomRef = ref(db, `rooms/${roomId.toUpperCase()}`);
    await remove(roomRef);
  }
}
