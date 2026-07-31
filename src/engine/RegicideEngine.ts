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
   * Helper to format structured log entry JSON.
   */
  private static log(key: string, params?: Record<string, string | number>): string {
    return JSON.stringify({ key, params });
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

    const castleDeck = this.buildCastleDeck();
    const firstEnemy = castleDeck.shift() || null;

    const { tavernDeck, soloJokers } = this.buildTavernDeck(playerCount, mode);

    const players: Player[] = playerConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      hand: [],
      isHost: config.isHost,
      isConnected: true,
    }));

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
      consecutivePassCount: 0,
      lastActionLog: [
        this.log('logGameStarted', { count: playerCount, rank: firstEnemy?.rank || '', suit: firstEnemy?.suit || '' })
      ],
      soloJokers: soloJokers || { availableCount: 0, usedCount: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Validates if a set of cards forms a legal play combination according to Regicide rules.
   */
  public static validatePlayedCards(cards: Card[]): { valid: boolean; reason?: string; params?: Record<string, string | number> } {
    if (cards.length === 0) {
      return { valid: false, reason: 'errNoCardsSelected' };
    }

    if (cards.length === 1) {
      return { valid: true };
    }

    const hasJoker = cards.some((c) => c.isJoker);
    if (hasJoker) {
      return { valid: false, reason: 'errJokerAlone' };
    }

    const aces = cards.filter((c) => c.rank === 'A');
    const nonAces = cards.filter((c) => c.rank !== 'A');

    if (aces.length > 0) {
      if (nonAces.length <= 1) {
        return { valid: true };
      } else {
        return { valid: false, reason: 'errAceComboInvalid' };
      }
    }

    const firstRank = cards[0].rank;
    const sameRank = cards.every((c) => c.rank === firstRank);

    if (!sameRank) {
      return { valid: false, reason: 'errComboSameRank' };
    }

    const totalSum = cards.reduce((sum, c) => sum + c.value, 0);
    if (totalSum > 10) {
      return { valid: false, reason: 'errComboMaxSum', params: { sum: totalSum } };
    }

    return { valid: true };
  }

  /**
   * Executes a player turn action (playing card/combo).
   */
  public static playTurn(state: GameState, playerId: string, playedCards: Card[]): ActionResult {
    if (state.status !== 'PLAY_CARD') {
      return { success: false, message: 'errNotInPlayPhase', nextState: state };
    }

    if (state.currentTurnPlayerId !== playerId) {
      return { success: false, message: 'errNotYourTurn', nextState: state };
    }

    const validation = this.validatePlayedCards(playedCards);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'errNoCardsSelected', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.', nextState: state };
    }

    nextState.consecutivePassCount = 0;

    const cardIdsToPlay = new Set(playedCards.map((c) => c.id));
    player.hand = player.hand.filter((c) => !cardIdsToPlay.has(c.id));
    nextState.playedCards.push(...playedCards);

    const enemy = nextState.currentEnemy;
    if (!enemy) {
      return { success: false, message: 'No active enemy.', nextState: state };
    }

    if (playedCards.length === 1 && playedCards[0].isJoker) {
      return this.handleJokerPlay(nextState, player, enemy);
    }

    const baseAttackValue = playedCards.reduce((sum, c) => sum + c.value, 0);
    const isImmune = (suit: Suit | null) => suit !== null && enemy.suit === suit && !enemy.isImmunityCancelled;

    const hasHearts = playedCards.some((c) => c.suit === 'HEARTS') && !isImmune('HEARTS');
    const hasDiamonds = playedCards.some((c) => c.suit === 'DIAMONDS') && !isImmune('DIAMONDS');
    const hasClubs = playedCards.some((c) => c.suit === 'CLUBS') && !isImmune('CLUBS');
    const hasSpades = playedCards.some((c) => c.suit === 'SPADES') && !isImmune('SPADES');

    if (hasHearts) {
      this.resolveHeartPower(nextState, baseAttackValue);
    }

    if (hasDiamonds) {
      this.resolveDiamondPower(nextState, player.id, baseAttackValue);
    }

    if (hasSpades) {
      enemy.currentShield += baseAttackValue;
      nextState.lastActionLog.push(this.log('logShieldIncreased', { amount: baseAttackValue, total: enemy.currentShield }));
    }

    const damageMultiplier = hasClubs ? 2 : 1;
    const finalDamage = baseAttackValue * damageMultiplier;

    enemy.currentHp -= finalDamage;
    const cardDescriptions = playedCards.map((c) => `${c.rank}`).join(', ');
    nextState.lastActionLog.push(this.log('logPlayerPlayed', { name: player.name, cards: cardDescriptions, damage: finalDamage }));

    if (enemy.currentHp <= 0) {
      return this.handleEnemyDefeated(nextState, player.id);
    }

    const effectiveEnemyAttack = Math.max(0, enemy.attack - enemy.currentShield);
    if (effectiveEnemyAttack === 0) {
      nextState.lastActionLog.push(this.log('logShieldBlocked'));
      this.advanceToNextTurn(nextState);
    } else {
      nextState.status = 'DISCARD_DAMAGE';
      nextState.pendingDamage = effectiveEnemyAttack;
      nextState.discardedDamageSum = 0;
      nextState.lastActionLog.push(this.log('logEnemyAttack', { damage: effectiveEnemyAttack, name: player.name }));
    }

    nextState.updatedAt = Date.now();
    return { success: true, message: 'Turn executed.', nextState };
  }

  /**
   * Resolves Joker play mechanics.
   */
  private static handleJokerPlay(state: GameState, player: Player, enemy: Enemy): ActionResult {
    enemy.isImmunityCancelled = true;
    state.lastActionLog.push(this.log('logJokerPlayed', { name: player.name, rank: enemy.rank }));

    if (enemy.suit === 'SPADES') {
      const previouslyPlayedSpades = state.playedCards.filter((c) => c.suit === 'SPADES' && !c.isJoker);
      const retroactiveShieldSum = previouslyPlayedSpades.reduce((sum, c) => sum + c.value, 0);
      if (retroactiveShieldSum > 0) {
        enemy.currentShield += retroactiveShieldSum;
        state.lastActionLog.push(this.log('logShieldIncreased', { amount: retroactiveShieldSum, total: enemy.currentShield }));
      }
    }

    if (state.mode === 'SOLO') {
      this.advanceToNextTurn(state);
      state.updatedAt = Date.now();
      return { success: true, message: 'Joker played in solo mode.', nextState: state };
    }

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
    nextState.lastActionLog.push(this.log('logTurnAssigned', { name: target.name }));
    nextState.updatedAt = Date.now();

    return { success: true, message: `Turn granted to ${target.name}.`, nextState };
  }

  /**
   * Resolves Heart suit power (Heal).
   */
  private static resolveHeartPower(state: GameState, amount: number): void {
    if (state.discardPile.length === 0 || amount <= 0) return;

    const shuffledDiscard = this.shuffleArray([...state.discardPile]);
    const healCount = Math.min(amount, shuffledDiscard.length);

    const healedCards = shuffledDiscard.slice(0, healCount);
    const remainingDiscard = shuffledDiscard.slice(healCount);

    state.tavernDeck.unshift(...healedCards);
    state.discardPile = remainingDiscard;

    state.lastActionLog.push(this.log('logHeartHealed', { count: healCount }));
  }

  /**
   * Resolves Diamond suit power (Recruit).
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

      if (consecutivePassesWithoutDraw >= state.players.length) {
        break;
      }

      currIdx = (currIdx + 1) % state.players.length;
    }

    state.lastActionLog.push(this.log('logDiamondRecruited', { count: cardsDrawn }));
  }

  /**
   * Handles enemy defeat resolution.
   */
  private static handleEnemyDefeated(state: GameState, killingPlayerId: string): ActionResult {
    const enemy = state.currentEnemy!;
    const isPerfectExecution = enemy.currentHp === 0;

    state.discardPile.push(...state.playedCards);
    state.playedCards = [];

    if (isPerfectExecution) {
      const enemyAsCard: Card = {
        id: enemy.id,
        suit: enemy.suit,
        rank: enemy.rank === 'JACK' ? 'J' : enemy.rank === 'QUEEN' ? 'Q' : 'K',
        value: enemy.rank === 'JACK' ? 10 : enemy.rank === 'QUEEN' ? 15 : 20,
        isJoker: false,
      };
      state.tavernDeck.push(enemyAsCard);
      state.lastActionLog.push(this.log('logPerfectExecution', { rank: enemy.rank, suit: enemy.suit }));
    } else {
      const enemyAsCard: Card = {
        id: enemy.id,
        suit: enemy.suit,
        rank: enemy.rank === 'JACK' ? 'J' : enemy.rank === 'QUEEN' ? 'Q' : 'K',
        value: enemy.rank === 'JACK' ? 10 : enemy.rank === 'QUEEN' ? 15 : 20,
        isJoker: false,
      };
      state.discardPile.push(enemyAsCard);
      state.lastActionLog.push(this.log('logEnemyDefeated', { rank: enemy.rank, suit: enemy.suit }));
    }

    if (state.castleDeck.length > 0) {
      state.currentEnemy = state.castleDeck.shift()!;
      state.status = 'PLAY_CARD';
      state.currentTurnPlayerId = killingPlayerId;
      state.consecutivePassCount = 0;
      state.lastActionLog.push(this.log('logNewEnemyRevealed', { rank: state.currentEnemy.rank, suit: state.currentEnemy.suit }));
      state.updatedAt = Date.now();
      return { success: true, message: 'Enemy defeated! Next enemy revealed.', nextState: state };
    }

    state.currentEnemy = null;
    state.status = 'VICTORY';
    state.lastActionLog.push(this.log('logVictory'));
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

    const discardValueSum = cardsToDiscard.reduce((sum, c) => sum + c.value, 0);

    player.hand = player.hand.filter((c) => !discardSet.has(c.id));
    nextState.discardPile.push(...cardsToDiscard);
    nextState.discardedDamageSum += discardValueSum;

    const cardsDesc = cardsToDiscard.map((c) => c.rank).join(', ');
    nextState.lastActionLog.push(this.log('logDiscarded', { name: player.name, cards: cardsDesc, value: discardValueSum, total: nextState.discardedDamageSum, required: nextState.pendingDamage }));

    if (nextState.discardedDamageSum >= nextState.pendingDamage) {
      nextState.pendingDamage = 0;
      nextState.discardedDamageSum = 0;
      this.advanceToNextTurn(nextState);
      nextState.updatedAt = Date.now();
      return { success: true, message: 'Damage successfully endured.', nextState };
    }

    if (player.hand.length === 0 && nextState.discardedDamageSum < nextState.pendingDamage) {
      nextState.status = 'GAME_OVER';
      nextState.lastActionLog.push(this.log('logGameOver', { name: player.name }));
      nextState.updatedAt = Date.now();
      return { success: true, message: 'Game over! Unable to absorb damage.', nextState };
    }

    nextState.updatedAt = Date.now();
    return { success: true, message: 'Cards discarded towards damage.', nextState };
  }

  /**
   * Handles player passing their turn.
   */
  public static passTurn(state: GameState, playerId: string): ActionResult {
    if (state.status !== 'PLAY_CARD') {
      return { success: false, message: 'errCannotPassOutsidePlay', nextState: state };
    }

    if (state.currentTurnPlayerId !== playerId) {
      return { success: false, message: 'errNotYourTurnPass', nextState: state };
    }

    if (state.players.length > 1 && state.consecutivePassCount >= state.players.length - 1) {
      return { success: false, message: 'errCannotPassConsecutive', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const enemy = nextState.currentEnemy;
    if (!enemy) {
      return { success: false, message: 'No active enemy.', nextState: state };
    }

    const player = nextState.players.find((p) => p.id === playerId);
    nextState.consecutivePassCount++;
    nextState.lastActionLog.push(this.log('logPlayerPassed', { name: player?.name || 'Player' }));

    const effectiveEnemyAttack = Math.max(0, enemy.attack - enemy.currentShield);

    if (effectiveEnemyAttack === 0) {
      nextState.lastActionLog.push(this.log('logShieldBlocked'));
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
   * Special Solo Mode Joker ability.
   */
  public static useSoloJoker(state: GameState, playerId: string): ActionResult {
    if (state.mode !== 'SOLO') {
      return { success: false, message: 'Solo Joker usage is only valid in Solo mode.', nextState: state };
    }

    if (state.soloJokers.availableCount <= 0) {
      return { success: false, message: 'errNoSoloJokersLeft', nextState: state };
    }

    const nextState: GameState = JSON.parse(JSON.stringify(state));
    const player = nextState.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Player not found.', nextState: state };
    }

    nextState.discardPile.push(...player.hand);
    player.hand = [];

    const handLimit = 8;
    while (player.hand.length < handLimit && nextState.tavernDeck.length > 0) {
      player.hand.push(nextState.tavernDeck.pop()!);
    }

    nextState.soloJokers.availableCount--;
    nextState.soloJokers.usedCount++;
    nextState.lastActionLog.push(this.log('logSoloJokerUsed', { name: player.name, count: player.hand.length }));
    nextState.updatedAt = Date.now();

    return { success: true, message: 'Solo Joker activated.', nextState };
  }

  /**
   * Advances turn clockwise.
   */
  private static advanceToNextTurn(state: GameState): void {
    const currIdx = state.players.findIndex((p) => p.id === state.currentTurnPlayerId);
    if (currIdx === -1) return;

    const nextIdx = (currIdx + 1) % state.players.length;
    state.currentTurnPlayerId = state.players[nextIdx].id;
    state.status = 'PLAY_CARD';
  }

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

    return [...jacks, ...queens, ...kings];
  }

  private static buildTavernDeck(playerCount: number, mode: GameMode): { tavernDeck: Card[]; soloJokers?: { availableCount: number; usedCount: number } } {
    const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const cards: Card[] = [];

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

  private static shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
