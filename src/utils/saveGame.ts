// 📁 src/utils/saveGame.ts

import { GameState } from '../types/game';

const SAVE_PREFIX = 'killthefacecards_saved_game_';

export function getSaveKey(playerName: string): string {
  return SAVE_PREFIX + playerName.trim().toLowerCase();
}

export function saveSoloGame(state: GameState): void {
  if (!state || state.mode !== 'SOLO' || state.players.length === 0) return;
  const playerName = state.players[0].name;
  const key = getSaveKey(playerName);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save solo game to localStorage:', err);
  }
}

export function loadSavedSoloGame(playerName: string): GameState | null {
  if (!playerName) return null;
  const key = getSaveKey(playerName);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed && parsed.status !== 'LOBBY' && parsed.status !== 'VICTORY' && parsed.status !== 'GAME_OVER') {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to load saved solo game from localStorage:', err);
    return null;
  }
}

export function clearSavedSoloGame(playerName: string): void {
  if (!playerName) return;
  const key = getSaveKey(playerName);
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear saved solo game:', err);
  }
}
