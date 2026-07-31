// 📁 src/engine/RegicideEngine.ts

import {
  Card,
  Enemy,
  GameMode,
  GameState,
  Player,
  Rank,
  Suit,
  ActionResult
} from '../types/game';

/**
 * Pure TypeScript game engine implementing official Regicide rules.
 * Completely decoupled from React and Firebase infrastructure.
 */
export class RegicideEngine {
  /**
   * Maximum hand sizes based on active player count.
   */
  public static getHandSizeLimit(playerCount: number): number {
    switch (playerCount) {
      case 1:
        return 8;
      case 2:
        return 7;
      case 3:
        return 6;
      case 4:
      default:
        return 5;
    }
  }

  /**
   * Creates a new game state with shuffled decks and initial hand distribution.
   */
  public static createNewGame(
    mode: GameMode,
    playerConfigs: { id: string; name: string; isHost: boolean }[],
    roomId: string
  ): GameState {
    const playerCount = Math.max(1, Math.min(4, playerConfigs.length));
    const handLimit = this.getHandSizeLimit(playerCount);

    // 1. Build Castle Deck (4 Jacks, 4 Queens, 4 Kings)
    const castleDeck = this.buildCastleDeck();
    const firstEnemy = castleDeck.shift() || null;

    // 2. Build Tavern Deck (Cards 1-10 + Jokers according to player count)
    const { tavernDeck, soloJokers } = this.buildTavernDeck(playerCount, mode);

    // 3. Create Players & Deal Initial Hands
    const players: Player[] = playerConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      hand: [],
      isHost: config.isHost,
      isConnected: true,
    }));

    // Deal cards clockwise to fill each player's hand up to limit
    for (let i = 0; i < handLimit; i++) {
      for (const player of players) {
        if (tavernDeck.length > 0) {
          player.hand.push(tavernDeck.pop()!);
        }
      }
    }

    const initialPlayerId = players[0]?.id || '';

    return {
      roomId,
      mode,
      status: 'PLAY_CARD',
      players,
      currentTurnPlayerId: initialPlayerId,
      currentEnemy: firstEnemy,
      castleDeck,
      tavernDeck,
      discardPile: [],
      playedCards: [],
      pendingDamage: 0,
      discardedDamageSum: 0,
      lastActionLog: [`Game started with ${playerCount} player(s). First enemy: ${firstEnemy?.rank} of ${firstEnemy?.suit}`],
      soloJokers: soloJokers || { availableCount: 0, usedCount: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Validates if a set of cards forms a legal play combination according to Regicide rules.
   */
  public static validatePlayedCards(cards: Card[]): { valid: boolean; reason?: string } {
    if (cards.length === 0) {
      return { valid: false, reason: 'No cards selected.' };
    }

    // Single card play
    if (cards.length === 1) {
      return { valid: true };
    }

    // Check if any card is a Joker
    const hasJoker = cards.some((c) => c.isJoker);
    if (hasJoker) {
      return { valid: false, reason: 'Jokers must be played alone.' };
    }

    // Check for Ace combination (1 base card + 1 or more Aces, or Ace + Ace)
    const aces = cards.filter((c) => c.rank === 'A');
    const nonAces = cards.filter((c) => c.rank !== 'A');

    if (aces.length > 0) {
      if (nonAces.length <= 1) {
        return { valid: true }; // Single card + Ace(s), or multiple Aces paired together
      } else {
        return { valid: false, reason: 'Cannot pair Aces with multiple non-Ace cards.' };
      }
    }

    // Check for standard Combos (Pairs, Triples, Quadruples of same numerical rank with total sum <= 10)
    const firstRank = cards[0].rank;
    const sameRank = cards.every((c) => c.rank === firstRank);

    if (!sameRank) {
      return { valid: false, reason: 'Combo cards must all have the exact same rank.' };
    }

    const totalSum = cards.reduce((sum, c) => sum + c.value, 0);
    if (totalSum > 10) {
      return { valid: false, reason: `Combo total value (${totalSum}) exceeds maximum limit of 10.` };
    }

    return { valid: true };
  }

  /**
   * Executes a player turn action (playing card/combo).
   */
  public static playTurn(state: GameState, playerId: string, playedCards: Card[]): ActionResult {
    if (state.status !== 'PLAY_CARD') {
      return { success: false, message: 'Not currently in card playing phase.', nextState: state };
    }

    if (state.currentTurnPlayerId !== playerId) {
      return { success: false, message: 'Not your turn.', nextState: state };
    }

    const validation = this.validatePlayedCards(playedCards);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'Invalid card combination.', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.', nextState: state };
    }

    // Remove played cards from player's hand
    const cardIdsToPlay = new Set(playedCards.map((c) => c.id));
    player.hand = player.hand.filter((c) => !cardIdsToPlay.has(c.id));
    nextState.playedCards.push(...playedCards);

    const enemy = nextState.currentEnemy;
    if (!enemy) {
      return { success: false, message: 'No active enemy.', nextState: state };
    }

    // Check for Joker play
    if (playedCards.length === 1 && playedCards[0].isJoker) {
      return this.handleJokerPlay(nextState, player, enemy);
    }

    // Calculate base attack value & powers
    const baseAttackValue = playedCards.reduce((sum, c) => sum + c.value, 0);
    
    // Determine active powers (respecting enemy suit immunity unless cancelled)
    const isImmune = (suit: Suit | null) => suit !== null && enemy.suit === suit && !enemy.isImmunityCancelled;

    const hasHearts = playedCards.some((c) => c.suit === 'HEARTS') && !isImmune('HEARTS');
    const hasDiamonds = playedCards.some((c) => c.suit === 'DIAMONDS') && !isImmune('DIAMONDS');
    const hasClubs = playedCards.some((c) => c.suit === 'CLUBS') && !isImmune('CLUBS');
    const hasSpades = playedCards.some((c) => c.suit === 'SPADES') && !isImmune('SPADES');

    // Rule: Resolve Hearts (Heal) BEFORE Diamonds (Draw)
    if (hasHearts) {
      this.resolveHeartPower(nextState, baseAttackValue);
    }

    if (hasDiamonds) {
      this.resolveDiamondPower(nextState, player.id, baseAttackValue);
    }

    if (hasSpades) {
      enemy.currentShield += baseAttackValue;
      nextState.lastActionLog.push(`Spade shield increased by ${baseAttackValue} (Total shield: ${enemy.currentShield}).`);
    }

    // Calculate Step 3 Damage to Enemy
    const damageMultiplier = hasClubs ? 2 : 1;
    const finalDamage = baseAttackValue * damageMultiplier;

    enemy.currentHp -= finalDamage;
    nextState.lastActionLog.push(`${player.name} played ${playedCards.map((c) => `${c.rank} of ${c.suit || 'Joker'}`).join(', ')} dealing ${finalDamage} damage.`);

    // Check if Enemy is defeated
    if (enemy.currentHp <= 0) {
      return this.handleEnemyDefeated(nextState, player.id);
    }

    // Step 4: Enemy Counter-Attack
    const effectiveEnemyAttack = Math.max(0, enemy.attack - enemy.currentShield);
    if (effectiveEnemyAttack === 0) {
      nextState.lastActionLog.push(`Enemy attack completely blocked by shield! Turn passes.`);
      this.advanceToNextTurn(nextState);
    } else {
      nextState.status = 'DISCARD_DAMAGE';
      nextState.pendingDamage = effectiveEnemyAttack;
      nextState.discardedDamageSum = 0;
      nextState.lastActionLog.push(`Enemy attacks for ${effectiveEnemyAttack} damage! ${player.name} must discard cards to endure.`);
    }

    nextState.updatedAt = Date.now();
    return { success: true, message: 'Turn executed.', nextState };
  }

  /**
   * Resolves Joker play mechanics (cancels immunity & yields turn choice in multiplayer).
   */
  private static handleJokerPlay(state: GameState, player: Player, enemy: Enemy): ActionResult {
    enemy.isImmunityCancelled = true;
    state.lastActionLog.push(`${player.name} played a Joker! ${enemy.rank}'s immunity cancelled.`);

    if (state.mode === 'SOLO') {
      // In solo mode, Joker yields immediate turn continuation
      this.advanceToNextTurn(state);
      state.updatedAt = Date.now();
      return { success: true, message: 'Joker played in solo mode.', nextState: state };
    }

    // Multiplayer mode: Player picks who takes the next turn
    state.status = 'YIELD_JOKER_CHOICE';
    state.updatedAt = Date.now();
    return { success: true, message: 'Select next player to take turn.', nextState: state };
  }

  /**
   * Allows active player who played a Joker in multiplayer to select the next player.
   */
  public static selectNextPlayerAfterJoker(state: GameState, targetPlayerId: string): ActionResult {
    if (state.status !== 'YIELD_JOKER_CHOICE') {
      return { success: false, message: 'Not waiting for Joker player selection.', nextState: state };
    }

    const target = state.players.find((p) => p.id === targetPlayerId);
    if (!target) {
      return { success: false, message: 'Target player not found.', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    nextState.currentTurnPlayerId = targetPlayerId;
    nextState.status = 'PLAY_CARD';
    nextState.lastActionLog.push(`Turn assigned to ${target.name} following Joker play.`);
    nextState.updatedAt = Date.now();

    return { success: true, message: `Turn granted to ${target.name}.`, nextState };
  }

  /**
   * Resolves Heart suit power (Heal): Shuffles discard pile and puts cards on bottom of Tavern deck.
   */
  private static resolveHeartPower(state: GameState, amount: number): void {
    if (state.discardPile.length === 0 || amount <= 0) return;

    // Shuffle discard pile
    const shuffledDiscard = this.shuffleArray([...state.discardPile]);
    const healCount = Math.min(amount, shuffledDiscard.length);

    const healedCards = shuffledDiscard.slice(0, healCount);
    const remainingDiscard = shuffledDiscard.slice(healCount);

    // Place healed cards at the BOTTOM of tavern deck (beginning of array)
    state.tavernDeck.unshift(...healedCards);
    state.discardPile = remainingDiscard;

    state.lastActionLog.push(`Heart power healed ${healCount} card(s) back into the Tavern deck.`);
  }

  /**
   * Resolves Diamond suit power (Recruit): Clockwise drawing from Tavern deck up to hand limits.
   */
  private static resolveDiamondPower(state: GameState, activePlayerId: string, amount: number): void {
    if (state.tavernDeck.length === 0 || amount <= 0) return;

    const handLimit = this.getHandSizeLimit(state.players.length);
    const playerIndex = state.players.findIndex((p) => p.id === activePlayerId);
    if (playerIndex === -1) return;

    let cardsDrawn = 0;
    let currIdx = playerIndex;
    let consecutivePassesWithoutDraw = 0;

    while (cardsDrawn < amount && state.tavernDeck.length > 0) {
      const p = state.players[currIdx];
      if (p.hand.length < handLimit) {
        p.hand.push(state.tavernDeck.pop()!);
        cardsDrawn++;
        consecutivePassesWithoutDraw = 0;
      } else {
        consecutivePassesWithoutDraw++;
      }

      // If all players have full hands, stop drawing
      if (consecutivePassesWithoutDraw >= state.players.length) {
        break;
      }

      currIdx = (currIdx + 1) % state.players.length;
    }

    state.lastActionLog.push(`Diamond power recruited ${cardsDrawn} card(s) across players.`);
  }

  /**
   * Handles enemy defeat resolution (Perfect Execution vs Overkill).
   */
  private static handleEnemyDefeated(state: GameState, killingPlayerId: string): ActionResult {
    const enemy = state.currentEnemy!;
    const isPerfectExecution = enemy.currentHp === 0;

    // Move played cards against this enemy to discard pile
    state.discardPile.push(...state.playedCards);
    state.playedCards = [];

    if (isPerfectExecution) {
      // Perfect Execution: Defeated enemy goes FACE DOWN on TOP of Tavern deck!
      const enemyAsCard: Card = {
        id: enemy.id,
        suit: enemy.suit,
        rank: enemy.rank === 'JACK' ? 'J' : enemy.rank === 'QUEEN' ? 'Q' : 'K',
        value: enemy.rank === 'JACK' ? 10 : enemy.rank === 'QUEEN' ? 15 : 20,
        isJoker: false,
      };
      state.tavernDeck.push(enemyAsCard);
      state.lastActionLog.push(`PERFECT EXECUTION! ${enemy.rank} of ${enemy.suit} placed on top of Tavern deck.`);
    } else {
      // Overkill: Defeated enemy goes to Discard pile
      const enemyAsCard: Card = {
        id: enemy.id,
        suit: enemy.suit,
        rank: enemy.rank === 'JACK' ? 'J' : enemy.rank === 'QUEEN' ? 'Q' : 'K',
        value: enemy.rank === 'JACK' ? 10 : enemy.rank === 'QUEEN' ? 15 : 20,
        isJoker: false,
      };
      state.discardPile.push(enemyAsCard);
      state.lastActionLog.push(`${enemy.rank} of ${enemy.suit} defeated and discarded.`);
    }

    // Reveal next enemy from Castle deck
    if (state.castleDeck.length > 0) {
      state.currentEnemy = state.castleDeck.shift()!;
      state.status = 'PLAY_CARD';
      state.currentTurnPlayerId = killingPlayerId; // Killing player immediately plays again!
      state.lastActionLog.push(`New enemy revealed: ${state.currentEnemy.rank} of ${state.currentEnemy.suit}.`);
      state.updatedAt = Date.now();
      return { success: true, message: 'Enemy defeated! Next enemy revealed.', nextState: state };
    }

    // Victory condition: Castle deck is empty and current enemy defeated!
    state.currentEnemy = null;
    state.status = 'VICTORY';
    state.lastActionLog.push('VICTORY! All 12 Kings and Court members have been slain!');
    state.updatedAt = Date.now();

    return { success: true, message: 'Victory achieved!', nextState: state };
  }

  /**
   * Processes player card discards during Step 4 counter-attack.
   */
  public static discardForDamage(state: GameState, playerId: string, cardIdsToDiscard: string[]): ActionResult {
    if (state.status !== 'DISCARD_DAMAGE') {
      return { success: false, message: 'Not currently enduring damage phase.', nextState: state };
    }

    if (state.currentTurnPlayerId !== playerId) {
      return { success: false, message: 'Not your turn.', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.', nextState: state };
    }

    const discardSet = new Set(cardIdsToDiscard);
    const cardsToDiscard = player.hand.filter((c) => discardSet.has(c.id));

    if (cardsToDiscard.length === 0) {
      return { success: false, message: 'No valid cards selected for discard.', nextState: state };
    }

    // Calculate discard value sum
    const discardValueSum = cardsToDiscard.reduce((sum, c) => sum + c.value, 0);

    // Remove discarded cards from player's hand and move to discard pile
    player.hand = player.hand.filter((c) => !discardSet.has(c.id));
    nextState.discardPile.push(...cardsToDiscard);
    nextState.discardedDamageSum += discardValueSum;

    nextState.lastActionLog.push(`${player.name} discarded ${cardsToDiscard.map((c) => c.rank).join(', ')} (${discardValueSum} value). Total: ${nextState.discardedDamageSum}/${nextState.pendingDamage}`);

    // Check if pending damage requirement fulfilled
    if (nextState.discardedDamageSum >= nextState.pendingDamage) {
      nextState.pendingDamage = 0;
      nextState.discardedDamageSum = 0;
      
      // Check if player or team loses due to empty hand & no possible plays
      this.advanceToNextTurn(nextState);
      nextState.updatedAt = Date.now();
      return { success: true, message: 'Damage successfully endured.', nextState };
    }

    // Check if player has run out of cards while still owing damage -> GAME OVER
    if (player.hand.length === 0 && nextState.discardedDamageSum < nextState.pendingDamage) {
      nextState.status = 'GAME_OVER';
      nextState.lastActionLog.push(`GAME OVER! ${player.name} could not endure the enemy counter-attack.`);
      nextState.updatedAt = Date.now();
      return { success: true, message: 'Game over! Unable to absorb damage.', nextState };
    }

    nextState.updatedAt = Date.now();
    return { success: true, message: 'Cards discarded towards damage.', nextState };
  }

  /**
   * Handles player passing their turn (skips steps 2 & 3, enters step 4).
   */
  public static passTurn(state: GameState, playerId: string): ActionResult {
    if (state.status !== 'PLAY_CARD') {
      return { success: false, message: 'Cannot pass outside play phase.', nextState: state };
    }

    if (state.currentTurnPlayerId !== playerId) {
      return { success: false, message: 'Not your turn to pass.', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const enemy = nextState.currentEnemy;
    if (!enemy) {
      return { success: false, message: 'No active enemy.', nextState: state };
    }

    const player = nextState.players.find((p) => p.id === playerId);
    nextState.lastActionLog.push(`${player?.name || 'Player'} passed their turn.`);

    // Check effective enemy attack
    const effectiveEnemyAttack = Math.max(0, enemy.attack - enemy.currentShield);

    if (effectiveEnemyAttack === 0) {
      nextState.lastActionLog.push('Enemy attack blocked by shield. Turn passes.');
      this.advanceToNextTurn(nextState);
    } else {
      nextState.status = 'DISCARD_DAMAGE';
      nextState.pendingDamage = effectiveEnemyAttack;
      nextState.discardedDamageSum = 0;
    }

    nextState.updatedAt = Date.now();
    return { success: true, message: 'Turn passed.', nextState };
  }

  /**
   * Special Solo Mode Joker ability: Discards hand and draws 8 fresh cards.
   */
  public static useSoloJoker(state: GameState, playerId: string): ActionResult {
    if (state.mode !== 'SOLO') {
      return { success: false, message: 'Solo Joker usage is only valid in Solo mode.', nextState: state };
    }

    if (state.soloJokers.availableCount <= 0) {
      return { success: false, message: 'No Solo Jokers remaining.', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.', nextState: state };
    }

    // Discard hand to discard pile
    nextState.discardPile.push(...player.hand);
    player.hand = [];

    // Draw 8 new cards from Tavern deck
    const handLimit = 8;
    while (player.hand.length < handLimit && nextState.tavernDeck.length > 0) {
      player.hand.push(nextState.tavernDeck.pop()!);
    }

    nextState.soloJokers.availableCount--;
    nextState.soloJokers.usedCount++;
    nextState.lastActionLog.push(`${player.name} used a Solo Joker! Hand refilled to ${player.hand.length} cards.`);
    nextState.updatedAt = Date.now();

    return { success: true, message: 'Solo Joker activated.', nextState };
  }

  /**
   * Advances the turn to the next connected player in clockwise sequence.
   */
  private static advanceToNextTurn(state: GameState): void {
    const currIdx = state.players.findIndex((p) => p.id === state.currentTurnPlayerId);
    if (currIdx === -1) return;

    const nextIdx = (currIdx + 1) % state.players.length;
    state.currentTurnPlayerId = state.players[nextIdx].id;
    state.status = 'PLAY_CARD';
  }

  /**
   * Constructs the 12-card Castle Deck (4 Jacks, 4 Queens, 4 Kings).
   */
  private static buildCastleDeck(): Enemy[] {
    const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];

    const jacks: Enemy[] = this.shuffleArray(
      suits.map((suit, i) => ({
        id: `JACK-${suit}-${i}`,
        rank: 'JACK',
        suit,
        maxHp: 20,
        currentHp: 20,
        attack: 10,
        currentShield: 0,
        isImmunityCancelled: false,
      }))
    );

    const queens: Enemy[] = this.shuffleArray(
      suits.map((suit, i) => ({
        id: `QUEEN-${suit}-${i}`,
        rank: 'QUEEN',
        suit,
        maxHp: 30,
        currentHp: 30,
        attack: 15,
        currentShield: 0,
        isImmunityCancelled: false,
      }))
    );

    const kings: Enemy[] = this.shuffleArray(
      suits.map((suit, i) => ({
        id: `KING-${suit}-${i}`,
        rank: 'KING',
        suit,
        maxHp: 40,
        currentHp: 40,
        attack: 20,
        currentShield: 0,
        isImmunityCancelled: false,
      }))
    );

    // Stack: Kings at bottom, Queens middle, Jacks on top
    return [...jacks, ...queens, ...kings];
  }

  /**
   * Constructs the Tavern Deck (40 suit cards + Jokers based on player count).
   */
  private static buildTavernDeck(playerCount: number, mode: GameMode): { tavernDeck: Card[]; soloJokers?: { availableCount: number; usedCount: number } } {
    const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const cards: Card[] = [];

    // Add cards 1-10 for each suit (Aces=1)
    suits.forEach((suit) => {
      for (let val = 1; val <= 10; val++) {
        const rank: Rank = val === 1 ? 'A' : (val.toString() as Rank);
        cards.push({
          id: `${suit}-${rank}`,
          suit,
          rank,
          value: val,
          isJoker: false,
        });
      }
    });

    let jokerCount = 0;
    let soloJokers = { availableCount: 0, usedCount: 0 };

    if (mode === 'SOLO') {
      jokerCount = 0;
      soloJokers = { availableCount: 2, usedCount: 0 };
    } else {
      if (playerCount === 3) jokerCount = 1;
      else if (playerCount === 4) jokerCount = 2;
    }

    for (let j = 1; j <= jokerCount; j++) {
      cards.push({
        id: `JOKER-${j}`,
        suit: null,
        rank: 'JOKER',
        value: 0,
        isJoker: true,
      });
    }

    return {
      tavernDeck: this.shuffleArray(cards),
      soloJokers,
    };
  }

  /**
   * Utility helper to perform Fisher-Yates array shuffling.
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
