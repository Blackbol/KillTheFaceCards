// 📁 src/services/firebase.ts

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  onDisconnect,
  Database
} from 'firebase/database';
import { GameMode, GameState } from '../types/game';
import { RegicideEngine } from '../engine/RegicideEngine';
import { debugLog, debugWarn } from '../utils/debug';

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

function withTimeout<T>(promise: Promise<T>, ms = 5000, errorMsg = 'Firebase operation timed out.'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms)
    ),
  ]);
}

export function getDatabaseInstance(): Database | null {
  if (dbInstance) return dbInstance;

  if (
    !firebaseConfig.databaseURL ||
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey.includes('your_') ||
    firebaseConfig.databaseURL.includes('your_')
  ) {
    debugWarn('FIREBASE', 'Running in offline mode.');
    return null;
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(firebaseConfig);
    } else {
      appInstance = getApps()[0];
    }
    dbInstance = getDatabase(appInstance);
    debugLog('FIREBASE', 'Database initialized successfully.');
    return dbInstance;
  } catch (error) {
    debugWarn('FIREBASE', 'Initialization error:', error);
    return null;
  }
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createRoom(
  hostName: string,
  mode: GameMode = 'MULTIPLAYER'
): Promise<{ roomId: string; playerId: string; initialState: GameState }> {
  const db = getDatabaseInstance();
  if (!db) {
    throw new Error('errFirebaseUnavailable');
  }

  let roomId = generateRoomCode();
  let attempts = 0;
  while (attempts < 5) {
    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      const existing = await withTimeout(get(roomRef), 3000, 'errFirebaseUnavailable');
      if (!existing.exists()) {
        break;
      }
    } catch (err: any) {
      debugWarn('FIREBASE', 'Room collision check error:', err);
      if (err.message && (err.message.includes('QUOTA') || err.message.includes('PERMISSION'))) {
        throw new Error('errQuotaExceeded');
      }
    }
    roomId = generateRoomCode();
    attempts++;
  }

  const hostId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const playerConfigs = [{ id: hostId, name: hostName, isHost: true }];
  const initialState = RegicideEngine.createNewGame(mode, playerConfigs, roomId);

  try {
    const roomRef = ref(db, `rooms/${roomId}`);
    await withTimeout(set(roomRef, initialState), 5000, 'errFirebaseUnavailable');
    debugLog('ROOM', `Created room ${roomId} for host ${hostName} (${hostId})`);
  } catch (err: any) {
    debugWarn('FIREBASE', 'Could not push room to remote database:', err);
    if (err.message && (err.message.includes('QUOTA') || err.message.includes('PERMISSION'))) {
      throw new Error('errQuotaExceeded');
    }
    throw new Error('errFirebaseUnavailable');
  }

  return { roomId, playerId: hostId, initialState };
}

export async function joinRoom(
  roomId: string,
  playerName: string
): Promise<{ success: boolean; playerId?: string; joinedState?: GameState; error?: string }> {
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
    debugLog('ROOM', `Player ${playerName} (${playerId}) joined room ${cleanRoomId}`);

    return { success: true, playerId, joinedState: updatedState };
  } catch (err: any) {
    if (err.message && (err.message.includes('QUOTA') || err.message.includes('PERMISSION'))) {
      return { success: false, error: 'errQuotaExceeded' };
    }
    return { success: false, error: err.message || 'errFirebaseUnavailable' };
  }
}

export function subscribeToRoom(
  roomId: string,
  callback: (state: GameState | null) => void
): () => void {
  const db = getDatabaseInstance();
  if (!db) return () => {};

  const roomRef = ref(db, `rooms/${roomId.toUpperCase()}`);

  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const rawState = snapshot.val() as GameState & { presence?: Record<string, { isConnected: boolean; disconnectedAt?: number }> };
      const presenceDict = rawState.presence || {};

      if (rawState.players) {
        rawState.players = rawState.players.map((p) => {
          const pres = presenceDict[p.id];
          if (pres) {
            return {
              ...p,
              isConnected: pres.isConnected ?? true,
              disconnectedAt: pres.disconnectedAt,
            };
          }
          return { ...p, isConnected: p.isConnected ?? true };
        });
      }

      debugLog('SYNC', `Room state update for ${roomId}: status=${rawState.status}, players=${rawState.players?.length}`);
      callback(rawState);
    } else {
      debugWarn('SYNC', `Room ${roomId} no longer exists in database.`);
      callback(null);
    }
  });

  return () => {
    off(roomRef, 'value', unsubscribe);
  };
}

export async function pushGameState(roomId: string, newState: GameState): Promise<void> {
  const db = getDatabaseInstance();
  if (!db) return;

  const roomRef = ref(db, `rooms/${roomId.toUpperCase()}`);
  await set(roomRef, newState);
}

/**
 * Registers player connection presence using keyed path rooms/${roomId}/presence/${playerId}.
 */
export function registerPlayerPresence(roomId: string, playerId: string): () => void {
  const db = getDatabaseInstance();
  if (!db) return () => {};

  const cleanRoomId = roomId.toUpperCase();
  const connectedRef = ref(db, '.info/connected');
  const playerPresenceRef = ref(db, `rooms/${cleanRoomId}/presence/${playerId}`);
  const pauseRef = ref(db, `rooms/${cleanRoomId}/isPaused`);

  const unsubscribe = onValue(connectedRef, async (snap) => {
    if (snap.val() === true) {
      debugLog('PRESENCE', `Player ${playerId} online in room ${cleanRoomId}`);
      await set(playerPresenceRef, { isConnected: true, updatedMs: Date.now() });

      onDisconnect(playerPresenceRef).set({ isConnected: false, disconnectedAt: Date.now() });

      const roomRef = ref(db, `rooms/${cleanRoomId}`);
      const roomSnap = await get(roomRef);
      if (roomSnap.exists()) {
        const state: GameState = roomSnap.val();
        if (state.status !== 'LOBBY') {
          onDisconnect(pauseRef).set(true);
        }
      }
    }
  });

  return () => {
    off(connectedRef, 'value', unsubscribe);
  };
}
