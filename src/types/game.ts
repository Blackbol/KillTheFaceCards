// 📁 src/types/game.ts

/**
 * Standard card suit types present in standard 54-card deck.
 */
export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';

/**
 * Card ranks spanning from Ace to King, plus Joker.
 */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOKER';

/**
 * Ranks specifically for Castle deck enemies.
 */
export type EnemyRank = 'JACK' | 'QUEEN' | 'KING';

/**
 * Card model representation in the engine.
 */
export interface Card {
  id: string;
  suit: Suit | null;
  rank: Rank;
  value: number; // A=1, 2-10=2-10, J=10, Q=15, K=20, Joker=0
  isJoker: boolean;
}

/**
 * Enemy card model representing current target in the Castle deck.
 */
export interface Enemy {
  id: string;
  rank: EnemyRank;
  suit: Suit;
  maxHp: number; // Jack=20, Queen=30, King=40
  currentHp: number;
  attack: number; // Jack=10, Queen=15, King=20
  currentShield: number; // Total Spade protection active against this enemy
  isImmunityCancelled: boolean; // Set to true if a Joker was played against this enemy
}

/**
 * Player model representing a local or online participant.
 */
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isHost: boolean;
  isConnected: boolean;
}

/**
 * Lifecycle steps of a active game session.
 */
export type GameStep = 
  | 'LOBBY'
  | 'PLAY_CARD'
  | 'YIELD_JOKER_CHOICE'
  | 'DISCARD_DAMAGE'
  | 'VICTORY'
  | 'GAME_OVER';

/**
 * Supported game modes.
 */
export type GameMode = 'SOLO' | 'MULTIPLAYER';

/**
 * Tracking state for solo mode Joker usage.
 */
export interface SoloJokerState {
  availableCount: number; // 2 at game start
  usedCount: number;
}

/**
 * Root game state representation used across engine, Firebase, and React.
 */
export interface GameState {
  roomId: string;
  mode: GameMode;
  status: GameStep;
  players: Player[];
  currentTurnPlayerId: string;
  currentEnemy: Enemy | null;
  castleDeck: Enemy[];
  tavernDeck: Card[];
  discardPile: Card[];
  playedCards: Card[];
  pendingDamage: number;
  discardedDamageSum: number;
  consecutivePassCount: number;
  lastActionLog: string[];
  soloJokers: SoloJokerState;
  createdAt: number;
  updatedAt: number;
}

/**
 * Action execution response object returned by the engine.
 */
export interface ActionResult {
  success: boolean;
  message: string;
  nextState: GameState;
  params?: Record<string, string | number>;
}
