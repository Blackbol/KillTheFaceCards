// 📁 src/engine/__tests__/RegicideEngine.test.ts

import { describe, it, expect } from 'vitest';
import { RegicideEngine } from '../RegicideEngine';
import { Card } from '../../types/game';

describe('RegicideEngine Unit Test Suite', () => {
  // Helper to construct mock cards
  const createCard = (suit: 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES' | null, rank: any, value: number, isJoker = false): Card => ({
    id: `${suit || 'JOKER'}-${rank}-${Math.random().toString(36).substring(2, 7)}`,
    suit,
    rank,
    value,
    isJoker,
  });

  describe('1. Game Setup & Hand Distribution', () => {
    it('correctly sets maximum hand size limits per player count', () => {
      expect(RegicideEngine.getHandSizeLimit(1)).toBe(8);
      expect(RegicideEngine.getHandSizeLimit(2)).toBe(7);
      expect(RegicideEngine.getHandSizeLimit(3)).toBe(6);
      expect(RegicideEngine.getHandSizeLimit(4)).toBe(5);
    });

    it('initializes Castle Deck with 12 cards stacked (4 Jacks, 4 Queens, 4 Kings)', () => {
      const state = RegicideEngine.createNewGame('MULTIPLAYER', [
        { id: 'p1', name: 'Alice', isHost: true },
        { id: 'p2', name: 'Bob', isHost: false },
      ], 'TEST');

      expect(state.currentEnemy).not.toBeNull();
      expect(state.currentEnemy?.rank).toBe('JACK');
      expect(state.currentEnemy?.maxHp).toBe(20);
      expect(state.currentEnemy?.attack).toBe(10);

      expect(state.castleDeck.length).toBe(11);
      const remainingJacks = state.castleDeck.filter((e) => e.rank === 'JACK');
      const remainingQueens = state.castleDeck.filter((e) => e.rank === 'QUEEN');
      const remainingKings = state.castleDeck.filter((e) => e.rank === 'KING');

      expect(remainingJacks.length).toBe(3);
      expect(remainingQueens.length).toBe(4);
      expect(remainingKings.length).toBe(4);
    });

    it('deals initial hands matching hand size limit per player', () => {
      const state = RegicideEngine.createNewGame('MULTIPLAYER', [
        { id: 'p1', name: 'Alice', isHost: true },
        { id: 'p2', name: 'Bob', isHost: false },
      ], 'TEST');

      expect(state.players[0].hand.length).toBe(7);
      expect(state.players[1].hand.length).toBe(7);
    });
  });

  describe('2. Card Combination Validation Rules', () => {
    it('validates single card plays', () => {
      const single = [createCard('HEARTS', '7', 7)];
      expect(RegicideEngine.validatePlayedCards(single).valid).toBe(true);
    });

    it('validates card + Ace combinations', () => {
      const cardPlusAce = [
        createCard('DIAMONDS', '8', 8),
        createCard('CLUBS', 'A', 1),
      ];
      expect(RegicideEngine.validatePlayedCards(cardPlusAce).valid).toBe(true);
    });

    it('validates valid combos (same rank, sum <= 10)', () => {
      const pairOfFives = [
        createCard('HEARTS', '5', 5),
        createCard('SPADES', '5', 5),
      ];
      expect(RegicideEngine.validatePlayedCards(pairOfFives).valid).toBe(true);

      const tripleThrees = [
        createCard('HEARTS', '3', 3),
        createCard('CLUBS', '3', 3),
        createCard('SPADES', '3', 3),
      ];
      expect(RegicideEngine.validatePlayedCards(tripleThrees).valid).toBe(true);
    });

    it('rejects invalid combos exceeding sum of 10', () => {
      const pairOfSixes = [
        createCard('HEARTS', '6', 6),
        createCard('SPADES', '6', 6),
      ];
      const result = RegicideEngine.validatePlayedCards(pairOfSixes);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('exceeds maximum limit of 10');
    });

    it('rejects playing Jokers with other cards', () => {
      const jokerPlusCard = [
        createCard(null, 'JOKER', 0, true),
        createCard('HEARTS', '5', 5),
      ];
      const result = RegicideEngine.validatePlayedCards(jokerPlusCard);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('alone');
    });
  });

  describe('3. Suit Powers & Rulebook Priority', () => {
    it('resolves Hearts power (heals discard pile to bottom of Tavern deck)', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      if (state.currentEnemy) state.currentEnemy.suit = 'SPADES';
      
      const discard1 = createCard('SPADES', '2', 2);
      const discard2 = createCard('CLUBS', '3', 3);
      state.discardPile = [discard1, discard2];

      const initialTavernLength = state.tavernDeck.length;

      const heartCard = createCard('HEARTS', '5', 5);
      state.players[0].hand = [heartCard];

      const result = RegicideEngine.playTurn(state, 'p1', [heartCard]);
      expect(result.success).toBe(true);

      expect(result.nextState.discardPile.length).toBe(0);
      expect(result.nextState.tavernDeck.length).toBe(initialTavernLength + 2);
    });

    it('resolves Hearts power BEFORE Diamonds power when played together', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      
      state.tavernDeck = [];
      if (state.currentEnemy) state.currentEnemy.suit = 'SPADES';
      const discard1 = createCard('SPADES', '4', 4);
      const discard2 = createCard('CLUBS', '6', 6);
      state.discardPile = [discard1, discard2];

      const heartFive = createCard('HEARTS', '5', 5);
      const diamondFive = createCard('DIAMONDS', '5', 5);
      state.players[0].hand = [heartFive, diamondFive];

      const result = RegicideEngine.playTurn(state, 'p1', [heartFive, diamondFive]);
      expect(result.success).toBe(true);

      expect(result.nextState.players[0].hand.length).toBeGreaterThan(0);
    });

    it('doubles damage in Step 3 when Clubs power is active', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      
      state.currentEnemy = {
        id: 'mock-enemy',
        rank: 'JACK',
        suit: 'HEARTS',
        maxHp: 20,
        currentHp: 20,
        attack: 10,
        currentShield: 0,
        isImmunityCancelled: false,
      };

      const clubEight = createCard('CLUBS', '8', 8);
      state.players[0].hand = [clubEight];

      const result = RegicideEngine.playTurn(state, 'p1', [clubEight]);
      expect(result.success).toBe(true);
      expect(result.nextState.currentEnemy?.currentHp).toBe(4);
    });

    it('accumulates Spade shield and reduces effective enemy counter-attack', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      
      state.currentEnemy = {
        id: 'mock-enemy',
        rank: 'JACK',
        suit: 'HEARTS',
        maxHp: 20,
        currentHp: 20,
        attack: 10,
        currentShield: 0,
        isImmunityCancelled: false,
      };

      const spadeSeven = createCard('SPADES', '7', 7);
      state.players[0].hand = [spadeSeven];

      const result = RegicideEngine.playTurn(state, 'p1', [spadeSeven]);
      expect(result.success).toBe(true);
      expect(result.nextState.currentEnemy?.currentShield).toBe(7);

      expect(result.nextState.status).toBe('DISCARD_DAMAGE');
      expect(result.nextState.pendingDamage).toBe(3);
    });
  });

  describe('4. Enemy Suit Immunity & Joker Cancellation', () => {
    it('cancels suit power if card suit matches enemy suit', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      
      state.currentEnemy = {
        id: 'mock-enemy',
        rank: 'QUEEN',
        suit: 'CLUBS',
        maxHp: 30,
        currentHp: 30,
        attack: 15,
        currentShield: 0,
        isImmunityCancelled: false,
      };

      const clubEight = createCard('CLUBS', '8', 8);
      state.players[0].hand = [clubEight];

      const result = RegicideEngine.playTurn(state, 'p1', [clubEight]);
      expect(result.success).toBe(true);
      expect(result.nextState.currentEnemy?.currentHp).toBe(22);
    });

    it('retroactively activates Spade shields when Joker is played against a Spade enemy', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      
      state.currentEnemy = {
        id: 'spade-jack',
        rank: 'JACK',
        suit: 'SPADES',
        maxHp: 20,
        currentHp: 20,
        attack: 10,
        currentShield: 0,
        isImmunityCancelled: false,
      };

      const spadeFive = createCard('SPADES', '5', 5);
      state.players[0].hand = [spadeFive];
      const res1 = RegicideEngine.playTurn(state, 'p1', [spadeFive]);
      expect(res1.nextState.currentEnemy?.currentShield).toBe(0);

      const joker = createCard(null, 'JOKER', 0, true);
      res1.nextState.players[0].hand.push(joker);
      res1.nextState.status = 'PLAY_CARD';

      const res2 = RegicideEngine.playTurn(res1.nextState, 'p1', [joker]);
      expect(res2.success).toBe(true);
      expect(res2.nextState.currentEnemy?.isImmunityCancelled).toBe(true);
      
      expect(res2.nextState.currentEnemy?.currentShield).toBe(5);
    });
  });

  describe('5. Enemy Defeat Resolution & Overkill', () => {
    it('places enemy FACE DOWN on TOP of Tavern deck on Perfect Execution (HP === 0)', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      
      state.currentEnemy = {
        id: 'jack-target',
        rank: 'JACK',
        suit: 'HEARTS',
        maxHp: 20,
        currentHp: 10,
        attack: 10,
        currentShield: 0,
        isImmunityCancelled: false,
      };

      // Play 10 of Clubs (deals 20 damage, but enemy HP is 10, wait: 10 of Clubs is Clubs (2x dmg) -> 20 dmg -> Overkill!)
      // To get exact 10 damage: play 10 of Spades (10 dmg, no multiplier)
      const spadeTen = createCard('SPADES', '10', 10);
      state.players[0].hand = [spadeTen];

      const result = RegicideEngine.playTurn(state, 'p1', [spadeTen]);
      expect(result.success).toBe(true);

      // Defeated enemy card is on top of Tavern deck!
      const topTavernCard = result.nextState.tavernDeck[result.nextState.tavernDeck.length - 1];
      expect(topTavernCard.rank).toBe('J');
      expect(topTavernCard.value).toBe(10);
    });

    it('places enemy in Discard pile on Overkill (HP < 0)', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      
      state.currentEnemy = {
        id: 'jack-target',
        rank: 'JACK',
        suit: 'HEARTS',
        maxHp: 20,
        currentHp: 5,
        attack: 10,
        currentShield: 0,
        isImmunityCancelled: false,
      };

      const tenCard = createCard('SPADES', '10', 10);
      state.players[0].hand = [tenCard];

      const result = RegicideEngine.playTurn(state, 'p1', [tenCard]);
      expect(result.success).toBe(true);

      const discardedEnemy = result.nextState.discardPile.find((c) => c.rank === 'J');
      expect(discardedEnemy).toBeDefined();
    });
  });

  describe('6. Passing Restrictions & Consecutive Passes', () => {
    it('allows a player to pass', () => {
      const state = RegicideEngine.createNewGame('MULTIPLAYER', [
        { id: 'p1', name: 'Alice', isHost: true },
        { id: 'p2', name: 'Bob', isHost: false },
      ], 'TEST');

      const result = RegicideEngine.passTurn(state, 'p1');
      expect(result.success).toBe(true);
      expect(result.nextState.consecutivePassCount).toBe(1);
    });

    it('forbids passing if all other players passed consecutively before active player', () => {
      const state = RegicideEngine.createNewGame('MULTIPLAYER', [
        { id: 'p1', name: 'Alice', isHost: true },
        { id: 'p2', name: 'Bob', isHost: false },
      ], 'TEST');

      // Set enemy shield to 10 so passing deals 0 damage and turn advances immediately
      if (state.currentEnemy) {
        state.currentEnemy.currentShield = 10;
      }

      // Player 1 passes (effective attack 0 -> turn passes to Player 2 in PLAY_CARD phase)
      const res1 = RegicideEngine.passTurn(state, 'p1');
      expect(res1.success).toBe(true);
      expect(res1.nextState.currentTurnPlayerId).toBe('p2');
      expect(res1.nextState.status).toBe('PLAY_CARD');

      // Player 2 tries to pass, but Player 1 already passed consecutively!
      const res2 = RegicideEngine.passTurn(res1.nextState, 'p2');
      expect(res2.success).toBe(false);
      expect(res2.message).toContain('Cannot pass if all other players passed consecutively');
    });
  });
});
