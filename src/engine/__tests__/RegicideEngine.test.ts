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
      expect(result.reason).toBe('errComboMaxSum');
      expect(result.params?.sum).toBe(12);
    });

    it('rejects playing Jokers with other cards', () => {
      const jokerPlusCard = [
        createCard(null, 'JOKER', 0, true),
        createCard('HEARTS', '5', 5),
      ];
      const result = RegicideEngine.validatePlayedCards(jokerPlusCard);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('errJokerAlone');
    });

    it('rejects Ace paired with multiple non-Ace cards', () => {
      const invalidAceCombo = [
        createCard('HEARTS', 'A', 1),
        createCard('DIAMONDS', '4', 4),
        createCard('SPADES', '4', 4),
      ];
      const result = RegicideEngine.validatePlayedCards(invalidAceCombo);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('errAceComboInvalid');
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
      const cardFour = createCard('HEARTS', '4', 4);
      state.players[0].hand = [spadeSeven, cardFour];

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

      const spadeTen = createCard('SPADES', '10', 10);
      state.players[0].hand = [spadeTen];

      const result = RegicideEngine.playTurn(state, 'p1', [spadeTen]);
      expect(result.success).toBe(true);

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

    it('triggers VICTORY when 12th King is slain', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      state.castleDeck = []; // No more remaining enemies
      state.currentEnemy = {
        id: 'final-king',
        rank: 'KING',
        suit: 'HEARTS',
        maxHp: 40,
        currentHp: 10,
        attack: 20,
        currentShield: 0,
        isImmunityCancelled: false,
      };

      const tenCard = createCard('SPADES', '10', 10);
      state.players[0].hand = [tenCard];

      const result = RegicideEngine.playTurn(state, 'p1', [tenCard]);
      expect(result.success).toBe(true);
      expect(result.nextState.status).toBe('VICTORY');
    });
  });

  describe('6. Passing Restrictions & Step 4 Counter-Attack', () => {
    it('allows a player to pass', () => {
      const state = RegicideEngine.createNewGame('MULTIPLAYER', [
        { id: 'p1', name: 'Alice', isHost: true },
        { id: 'p2', name: 'Bob', isHost: false },
      ], 'TEST');
      state.status = 'PLAY_CARD';

      const result = RegicideEngine.passTurn(state, 'p1');
      expect(result.success).toBe(true);
      expect(result.nextState.consecutivePassCount).toBe(1);
    });

    it('forbids passing if all other players passed consecutively before active player', () => {
      const state = RegicideEngine.createNewGame('MULTIPLAYER', [
        { id: 'p1', name: 'Alice', isHost: true },
        { id: 'p2', name: 'Bob', isHost: false },
      ], 'TEST');
      state.status = 'PLAY_CARD';

      if (state.currentEnemy) {
        state.currentEnemy.currentShield = 10;
      }

      const res1 = RegicideEngine.passTurn(state, 'p1');
      expect(res1.success).toBe(true);
      expect(res1.nextState.currentTurnPlayerId).toBe('p2');

      const res2 = RegicideEngine.passTurn(res1.nextState, 'p2');
      expect(res2.success).toBe(false);
      expect(res2.message).toBe('errCannotPassConsecutive');
    });

    it('skips discard phase if Spade shield completely blocks enemy attack', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      state.currentEnemy = {
        id: 'jack-blocked',
        rank: 'JACK',
        suit: 'HEARTS',
        maxHp: 20,
        currentHp: 15,
        attack: 10,
        currentShield: 10, // Full shield equal to attack!
        isImmunityCancelled: false,
      };

      const res = RegicideEngine.passTurn(state, 'p1');
      expect(res.success).toBe(true);
      // Net damage is 0, so discard phase is skipped!
      expect(res.nextState.status).toBe('PLAY_CARD');
    });

    it('allows batch discarding multiple cards to fulfill required damage', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      state.status = 'DISCARD_DAMAGE';
      state.pendingDamage = 10;
      state.discardedDamageSum = 0;

      const card4 = createCard('SPADES', '4', 4);
      const card6 = createCard('HEARTS', '6', 6);
      state.players[0].hand = [card4, card6];

      const res = RegicideEngine.discardForDamage(state, 'p1', [card4.id, card6.id]);
      expect(res.success).toBe(true);
      expect(res.nextState.status).toBe('PLAY_CARD');
      expect(res.nextState.pendingDamage).toBe(0);
    });

    it('triggers GAME_OVER if player discards entire hand without reaching required damage', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      state.status = 'DISCARD_DAMAGE';
      state.pendingDamage = 15;
      state.discardedDamageSum = 0;

      const card3 = createCard('SPADES', '3', 3);
      state.players[0].hand = [card3];

      const res = RegicideEngine.discardForDamage(state, 'p1', [card3.id]);
      expect(res.success).toBe(true);
      expect(res.nextState.status).toBe('GAME_OVER');
    });
  });

  describe('7. Regicide Solo Mode Special Rules', () => {
    it('allows Solo Joker to refill player hand up to 8 cards and increments usedCount', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      expect(state.soloJokers.availableCount).toBe(2);
      expect(state.soloJokers.usedCount).toBe(0);

      state.players[0].hand = [createCard('HEARTS', '2', 2)];

      const res = RegicideEngine.useSoloJoker(state, 'p1');
      expect(res.success).toBe(true);
      expect(res.nextState.soloJokers.availableCount).toBe(1);
      expect(res.nextState.soloJokers.usedCount).toBe(1);
      expect(res.nextState.players[0].hand.length).toBe(8);
    });

    it('rejects using Solo Joker when 0 jokers remain', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      state.soloJokers.availableCount = 0;

      const res = RegicideEngine.useSoloJoker(state, 'p1');
      expect(res.success).toBe(false);
      expect(res.message).toBe('errNoSoloJokersLeft');
    });
  });

  describe('8. Multiplayer Lobby & Kicked Player Operations', () => {
    it('allows host to kick a player from the lobby', () => {
      const state = RegicideEngine.createNewGame(
        'MULTIPLAYER',
        [
          { id: 'host-1', name: 'Host', isHost: true },
          { id: 'player-2', name: 'Guest', isHost: false },
        ],
        'LOBBY1'
      );
      expect(state.players.length).toBe(2);

      const res = RegicideEngine.kickPlayerFromLobby(state, 'host-1', 'player-2');
      expect(res.success).toBe(true);
      expect(res.nextState.players.length).toBe(1);
      expect(res.nextState.players.some((p) => p.id === 'player-2')).toBe(false);
      expect(res.nextState.lastActionLog.some((l) => l.includes('logPlayerKicked'))).toBe(true);
    });

    it('rejects host kicking themselves or non-host kicking players', () => {
      const state = RegicideEngine.createNewGame(
        'MULTIPLAYER',
        [
          { id: 'host-1', name: 'Host', isHost: true },
          { id: 'player-2', name: 'Guest', isHost: false },
        ],
        'LOBBY2'
      );

      const selfKick = RegicideEngine.kickPlayerFromLobby(state, 'host-1', 'host-1');
      expect(selfKick.success).toBe(false);
      expect(selfKick.message).toBe('Host cannot kick themselves.');

      const nonHostKick = RegicideEngine.kickPlayerFromLobby(state, 'player-2', 'host-1');
      expect(nonHostKick.success).toBe(false);
      expect(nonHostKick.message).toBe('Only the host can kick players.');
    });

    it('returns isHostLeaving true when host leaves room', () => {
      const state = RegicideEngine.createNewGame(
        'MULTIPLAYER',
        [
          { id: 'host-1', name: 'Host', isHost: true },
          { id: 'player-2', name: 'Guest', isHost: false },
        ],
        'LOBBY3'
      );

      const res = RegicideEngine.leavePlayerFromRoom(state, 'host-1');
      expect(res.isHostLeaving).toBe(true);
    });

    it('removes non-host player and advances turn when leaving during active turn', () => {
      const state = RegicideEngine.createNewGame(
        'MULTIPLAYER',
        [
          { id: 'host-1', name: 'Host', isHost: true },
          { id: 'player-2', name: 'Guest', isHost: false },
        ],
        'LOBBY4'
      );
      state.status = 'PLAY_CARD';
      state.currentTurnPlayerId = 'player-2';

      const res = RegicideEngine.leavePlayerFromRoom(state, 'player-2');
      expect(res.isHostLeaving).toBe(false);
      expect(res.nextState.players.length).toBe(1);
      expect(res.nextState.currentTurnPlayerId).toBe('host-1');
    });

    it('logs logPlayerPassedTimer when turn is passed by timer action', () => {
      const state = RegicideEngine.createNewGame('SOLO', [{ id: 'p1', name: 'Alice', isHost: true }], 'TEST');
      state.status = 'PLAY_CARD';

      const res = RegicideEngine.passTurn(state, 'p1', true);
      expect(res.success).toBe(true);
      expect(res.nextState.lastActionLog.some((l) => l.includes('logPlayerPassedTimer'))).toBe(true);
    });
  });
});
