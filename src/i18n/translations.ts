// 📁 src/i18n/translations.ts

export type Language = 'en' | 'fr';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  room: string;
  mode: string;
  solo: string;
  multiplayer: string;
  multiplayerDisabled: string;
  create: string;
  join: string;
  startSolo: string;
  createRoom: string;
  joinRoom: string;
  playerName: string;
  playerPlaceholder: string;
  defaultSoloName: string;
  defaultHostName: string;
  defaultJoinName: string;
  roomCode: string;
  roomCodePlaceholder: string;
  tavernDeck: string;
  discardPile: string;
  castleDeckRemaining: string;
  cardsPlayed: string;
  battleLog: string;
  yourTurn: string;
  playerTurn: string;
  attack: string;
  passTurn: string;
  useSoloJoker: string;
  clear: string;
  discardSelected: string;
  endureDamage: string;
  discardValue: string;
  jokerPlayedSelectNext: string;
  jokerPlayedDescription: string;
  victory: string;
  victoryDesc: string;
  gameOver: string;
  gameOverDesc: string;
  returnToLobby: string;
  goldMedal: string;
  silverMedal: string;
  bronzeMedal: string;
  cardSingular: string;
  cardPlural: string;
  waitingForPlayer: string;
  leaveGame: string;
  noCardsPlayed: string;
  handEmpty: string;
  attackValue: string;
  doubleDmg: string;
  heal: string;
  recruit: string;
  shield: string;
  immunityCancelled: string;
  immuneTo: string;
  shieldActive: string;
  healthPoints: string;
  hpUnit: string;
  allEnemiesSlain: string;
  legalFooter: string;
  regicideDesignBy: string;
  noOfficialArt: string;
  connecting: string;
  handLimitsInfo: string;
  rulesQuickRef: string;
  
  // Save & Resume Game translations
  saveGameTitle: string;
  saveGameDesc: string;
  saveAndQuit: string;
  quitWithoutSave: string;
  cancel: string;
  resumeSavedGame: string;
  savedGameDetails: string;

  // Suits
  hearts: string;
  diamonds: string;
  clubs: string;
  spades: string;
  joker: string;

  // Enemy Ranks
  jack: string;
  queen: string;
  king: string;
  ace: string;
  
  // Card Rank Display Letters on Card Faces
  rankJackDisplay: string;
  rankQueenDisplay: string;
  rankKingDisplay: string;
  rankAceDisplay: string;

  // Log translations
  logGameStarted: string;
  logShieldIncreased: string;
  logPlayerPlayed: string;
  logEnemyDefeated: string;
  logPerfectExecution: string;
  logNewEnemyRevealed: string;
  logEnemyAttack: string;
  logDiscarded: string;
  logPlayerPassed: string;
  logSoloJokerUsed: string;
  logJokerPlayed: string;
  logTurnAssigned: string;
  logVictory: string;
  logGameOver: string;
  logHeartHealed: string;
  logDiamondRecruited: string;
  logShieldBlocked: string;

  // Error & Validation translations
  errNoCardsSelected: string;
  errJokerAlone: string;
  errAceComboInvalid: string;
  errComboSameRank: string;
  errComboMaxSum: string;
  errNotYourTurn: string;
  errNotInPlayPhase: string;
  errPlayerNotFound: string;
  errNoActiveEnemy: string;
  errNotWaitingJokerChoice: string;
  errTargetPlayerNotFound: string;
  errNotInDiscardPhase: string;
  errCannotPassOutsidePlay: string;
  errNotYourTurnPass: string;
  errCannotPassConsecutive: string;
  errSoloOnlyJoker: string;
  errNoSoloJokersLeft: string;
  errFirebaseUnavailable: string;
  errRoomNotFound: string;
  errGameAlreadyStarted: string;
  errRoomFull: string;

  // Official Rulebook Reference
  rulesTitle: string;
  rulesGoalTitle: string;
  rulesGoalDesc: string;
  rulesEnemiesTitle: string;
  rulesEnemiesDesc: string;
  rulesTurnStructureTitle: string;
  rulesTurnStructureDesc: string;
  rulesSuitsTitle: string;
  rulesHeartsDesc: string;
  rulesDiamondsDesc: string;
  rulesClubsDesc: string;
  rulesSpadesDesc: string;
  rulesImmunityTitle: string;
  rulesImmunityDesc: string;
  rulesCombosTitle: string;
  rulesCombosDesc: string;
  rulesAcesTitle: string;
  rulesAcesDesc: string;
  rulesExecutionTitle: string;
  rulesExecutionDesc: string;
  rulesCounterTitle: string;
  rulesCounterDesc: string;
  rulesPassingTitle: string;
  rulesPassingDesc: string;
  close: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'KILL THE FACE CARDS',
    appSubtitle: 'Cooperative Card Combat • Fan Adaptation of Regicide',
    room: 'ROOM',
    mode: 'MODE',
    solo: 'Solo',
    multiplayer: 'Multiplayer',
    multiplayerDisabled: 'Multiplayer (Coming Soon)',
    create: 'Create',
    join: 'Join',
    startSolo: 'Start Solo Game',
    createRoom: 'Create Multiplayer Room',
    joinRoom: 'Join Room',
    playerName: 'Player Name',
    playerPlaceholder: 'Enter your hero name...',
    defaultSoloName: 'Solo Knight',
    defaultHostName: 'Host Commander',
    defaultJoinName: 'Challenger',
    roomCode: '4-Letter Room Code',
    roomCodePlaceholder: 'e.g. KNGS',
    tavernDeck: 'Tavern Deck',
    discardPile: 'Discard Pile',
    castleDeckRemaining: 'Castle Deck: {count} remaining enemies',
    cardsPlayed: 'Cards Played This Round',
    battleLog: 'Battle Log',
    yourTurn: 'Your Turn to Play!',
    playerTurn: "{name}'s Turn",
    attack: 'Attack ({count} cards)',
    passTurn: 'Pass Turn',
    useSoloJoker: 'Use Solo Joker ({count} left)',
    clear: 'Clear',
    discardSelected: 'Discard Selected Cards',
    endureDamage: 'Damage to Endure: {current} / {required} HP',
    discardValue: 'Discard Value',
    jokerPlayedSelectNext: 'Joker Played! Select Next Player',
    jokerPlayedDescription: 'Choose which teammate will take the next turn against the active enemy.',
    victory: 'VICTORY!',
    victoryDesc: 'All 12 members of the Royal Court have been slain! The kingdom is freed.',
    gameOver: 'GAME OVER',
    gameOverDesc: "Your party was overwhelmed by the enemy's counter-attack damage.",
    returnToLobby: 'Return to Lobby',
    goldMedal: 'GOLD MEDAL (0 Jokers Used)',
    silverMedal: 'SILVER MEDAL (1 Joker Used)',
    bronzeMedal: 'BRONZE MEDAL (2 Jokers Used)',
    cardSingular: 'card',
    cardPlural: 'cards',
    waitingForPlayer: 'Waiting for active player to finish turn...',
    leaveGame: 'Leave Game',
    noCardsPlayed: 'No cards played yet against this enemy.',
    handEmpty: 'Your hand is empty.',
    attackValue: 'Attack Value',
    doubleDmg: 'Double Dmg',
    heal: 'Heal',
    recruit: 'Recruit',
    shield: 'Shield',
    immunityCancelled: 'Immunity Cancelled (Joker)',
    immuneTo: 'Immune to',
    shieldActive: 'Shield Active: -{shield} Atk (Net Atk: {net})',
    healthPoints: 'Health Points',
    hpUnit: 'HP',
    allEnemiesSlain: 'All Enemies Slain!',
    legalFooter: 'Kill The Face Cards is a 100% free, fan-made web adaptation based on the mechanics of the cooperative card game Regicide.',
    regicideDesignBy: 'Regicide original game design by Paul Abrahams, Luke Badger & Andy Richdale. Published by Badgers from Mars and Iello.',
    noOfficialArt: 'No official trademarks or artwork used. Standard 54-card deck mechanics. 0 ads, 0 tracking.',
    connecting: 'Connecting...',
    handLimitsInfo: 'Solo (8 limit) • 2 Players (7 limit) • 3 Players (6 limit) • 4 Players (5 limit)',
    rulesQuickRef: 'Rules',

    saveGameTitle: 'Save Active Game?',
    saveGameDesc: 'Would you like to save your solo game in progress to resume later with this username?',
    saveAndQuit: 'Save & Quit',
    quitWithoutSave: 'Quit without saving',
    cancel: 'Cancel',
    resumeSavedGame: 'Resume Saved Solo Game',
    savedGameDetails: 'Enemy: {rank} of {suit} • {cards} cards in hand',

    hearts: 'Hearts',
    diamonds: 'Diamonds',
    clubs: 'Clubs',
    spades: 'Spades',
    joker: 'Joker',

    jack: 'Jack',
    queen: 'Queen',
    king: 'King',
    ace: 'Ace',

    rankJackDisplay: 'J',
    rankQueenDisplay: 'Q',
    rankKingDisplay: 'K',
    rankAceDisplay: 'A',

    logGameStarted: 'Game started with {count} player(s). First enemy: {rank} of {suit}',
    logShieldIncreased: 'Spade shield increased by {amount} (Total shield: {total})',
    logPlayerPlayed: '{name} played {cards} dealing {damage} damage.',
    logEnemyDefeated: '{rank} of {suit} defeated and discarded.',
    logPerfectExecution: 'PERFECT EXECUTION! {rank} of {suit} placed on top of Tavern deck.',
    logNewEnemyRevealed: 'New enemy revealed: {rank} of {suit}.',
    logEnemyAttack: 'Enemy attacks for {damage} damage! {name} must discard cards to endure.',
    logDiscarded: '{name} discarded {cards} ({value} value). Total: {total}/{required}',
    logPlayerPassed: '{name} passed their turn.',
    logSoloJokerUsed: '{name} used a Solo Joker! Hand refilled to {count} cards.',
    logJokerPlayed: '{name} played a Joker! {rank}\'s immunity cancelled.',
    logTurnAssigned: 'Turn assigned to {name} following Joker play.',
    logVictory: 'VICTORY! All 12 Kings and Court members have been slain!',
    logGameOver: 'GAME OVER! {name} could not endure the enemy counter-attack.',
    logHeartHealed: 'Heart power healed {count} card(s) back into the Tavern deck.',
    logDiamondRecruited: 'Diamond power recruited {count} card(s) across players.',
    logShieldBlocked: 'Enemy attack completely blocked by shield! Turn passes.',

    errNoCardsSelected: 'No cards selected.',
    errJokerAlone: 'Jokers must be played alone.',
    errAceComboInvalid: 'Cannot pair Aces with multiple non-Ace cards.',
    errComboSameRank: 'Combo cards must all have the exact same rank.',
    errComboMaxSum: 'Combo total value ({sum}) exceeds maximum limit of 10.',
    errNotYourTurn: 'Not your turn.',
    errNotInPlayPhase: 'Not currently in card playing phase.',
    errPlayerNotFound: 'Player not found.',
    errNoActiveEnemy: 'No active enemy.',
    errNotWaitingJokerChoice: 'Not waiting for Joker player selection.',
    errTargetPlayerNotFound: 'Target player not found.',
    errNotInDiscardPhase: 'Not currently enduring damage phase.',
    errCannotPassOutsidePlay: 'Cannot pass outside play phase.',
    errNotYourTurnPass: 'Not your turn to pass.',
    errCannotPassConsecutive: 'Cannot pass if all other players passed consecutively.',
    errSoloOnlyJoker: 'Solo Joker usage is only valid in Solo mode.',
    errNoSoloJokersLeft: 'No Solo Jokers remaining.',
    errFirebaseUnavailable: 'Firebase Database is not configured. Please set environment variables.',
    errRoomNotFound: 'Room not found. Check code.',
    errGameAlreadyStarted: 'Game has already started in this room.',
    errRoomFull: 'Room is full (max 4 players).',

    rulesTitle: 'Official Rulebook & Game Mechanics',
    rulesGoalTitle: 'Objective of the Game',
    rulesGoalDesc: 'Defeat all 12 members of the Royal Court (4 Jacks, 4 Queens, 4 Kings) stacked in the Castle Deck. Work together to survive their formidable counter-attacks.',
    rulesEnemiesTitle: 'The 12 Royal Enemies',
    rulesEnemiesDesc: 'Jacks: 20 HP / 10 Attack • Queens: 30 HP / 15 Attack • Kings: 40 HP / 20 Attack. Enemies are revealed sequentially from Jacks up to Kings.',
    rulesTurnStructureTitle: 'Turn Structure (4 Steps)',
    rulesTurnStructureDesc: '1. Play a card (or combo) or pass • 2. Apply Suit Power • 3. Deal damage & check enemy defeat • 4. Endure enemy counter-attack damage by discarding.',
    rulesSuitsTitle: 'Suit Powers (Step 2)',
    rulesHeartsDesc: '♥️ Hearts (Heal): Shuffles discard pile and places cards equal to played value at the bottom of the Tavern deck.',
    rulesDiamondsDesc: '♦️ Diamonds (Recruit): Players draw cards from the Tavern deck clockwise up to their maximum hand limits.',
    rulesClubsDesc: '♣️ Clubs (Double Damage): Doubles the attack damage dealt in Step 3.',
    rulesSpadesDesc: '♠️ Spades (Shield): Reduces the enemy\'s attack value for Step 4. Shields remain active until the current enemy is slain.',
    rulesImmunityTitle: 'Enemy Immunity & Jokers',
    rulesImmunityDesc: 'Each enemy is immune to the power of their own suit (e.g. Jack of Spades ignores Spade shields). Playing a Joker cancels the active enemy\'s suit immunity!',
    rulesCombosTitle: 'Combinations (Combos)',
    rulesCombosDesc: 'Cards of identical rank can be played together if their total sum <= 10 (e.g., pair of 2s, 3s, 4s, 5s, or triple 2s, 3s). All suit powers apply!',
    rulesAcesTitle: 'Aces (Companions)',
    rulesAcesDesc: 'Aces (1 Value) can be played with any single card to add +1 attack and activate a second suit power! Heart powers always resolve BEFORE Diamond powers.',
    rulesExecutionTitle: 'Perfect Execution vs Excess Damage',
    rulesExecutionDesc: 'If an enemy is reduced to EXACTLY 0 HP, it is placed FACE DOWN on TOP of the Tavern deck as a recruit! If HP < 0 (Excess Damage), it goes to the Discard pile.',
    rulesCounterTitle: 'Enduring Counter-Attack (Step 4)',
    rulesCounterDesc: 'If the enemy is not slain, the active player must discard cards from hand totaling >= net enemy attack (Base Atk minus Spade shield). Failing to discard enough causes Game Over.',
    rulesPassingTitle: 'Passing Turn',
    rulesPassingDesc: 'A player may pass their turn (unless all other players passed consecutively). Passing skips Step 2 & 3, but the player MUST still endure the enemy counter-attack in Step 4!',
    close: 'Close',
  },
  fr: {
    appTitle: 'KILL THE FACE CARDS',
    appSubtitle: 'Combat de cartes coopératif • Adaptation Fan de Régicide',
    room: 'SALON',
    mode: 'MODE',
    solo: 'Solo',
    multiplayer: 'Multijoueur',
    multiplayerDisabled: 'Multijoueur (Bientôt disponible)',
    create: 'Créer',
    join: 'Rejoindre',
    startSolo: 'Démarrer Partie Solo',
    createRoom: 'Créer un Salon Multijoueur',
    joinRoom: 'Rejoindre un Salon',
    playerName: 'Nom de Joueur',
    playerPlaceholder: 'Entrez votre nom de héros...',
    defaultSoloName: 'Chevalier Solo',
    defaultHostName: 'Commandant Hôte',
    defaultJoinName: 'Challenger',
    roomCode: 'Code de Salon à 4 Lettres',
    roomCodePlaceholder: 'ex: KNGS',
    tavernDeck: 'Paquet Taverne',
    discardPile: 'Défausse',
    castleDeckRemaining: 'Paquet Château : {count} ennemis restants',
    cardsPlayed: 'Cartes Jouées ce Tour',
    battleLog: 'Journal de Combat',
    yourTurn: 'À votre tour de jouer !',
    playerTurn: 'Tour de {name}',
    attack: 'Attaquer ({count} carte(s))',
    passTurn: 'Passer son tour',
    useSoloJoker: 'Utiliser Joker Solo ({count} restant(s))',
    clear: 'Effacer',
    discardSelected: 'Défausser les cartes sélectionnées',
    endureDamage: 'Subir les Dégâts : {current} / {required} PV',
    discardValue: 'Valeur de Défausse',
    jokerPlayedSelectNext: 'Joker Joué ! Désignez le Prochain Joueur',
    jokerPlayedDescription: 'Choisissez le coéquipier qui prendra le prochain tour contre l’ennemi actuel.',
    victory: 'VICTOIRE !',
    victoryDesc: 'Les 12 membres de la Cour Royale ont été vaincus ! Le royaume est libéré.',
    gameOver: 'DÉFAITE',
    gameOverDesc: 'Votre groupe a succombé à la riposte de l’ennemi.',
    returnToLobby: 'Retour au Salon',
    goldMedal: 'MÉDAILLE D’OR (0 Joker utilisé)',
    silverMedal: 'MÉDAILLE D’ARGENT (1 Joker utilisé)',
    bronzeMedal: 'MÉDAILLE DE BRONZE (2 Jokers utilisés)',
    cardSingular: 'carte',
    cardPlural: 'cartes',
    waitingForPlayer: 'En attente du tour du joueur actif...',
    leaveGame: 'Quitter la Partie',
    noCardsPlayed: 'Aucune carte jouée pour l’instant contre cet ennemi.',
    handEmpty: 'Votre main est vide.',
    attackValue: 'Valeur d’Attaque',
    doubleDmg: 'Dégâts x2',
    heal: 'Soin',
    recruit: 'Recruter',
    shield: 'Bouclier',
    immunityCancelled: 'Immunité Annulée (Joker)',
    immuneTo: 'Immunisé aux',
    shieldActive: 'Bouclier Actif : -{shield} Atk (Atk Nette : {net})',
    healthPoints: 'Points de Vie',
    hpUnit: 'PV',
    allEnemiesSlain: 'Tous les Ennemis Vaincus !',
    legalFooter: 'Kill The Face Cards est une adaptation web fan-made 100 % gratuite basée sur les mécaniques du jeu coopératif Régicide.',
    regicideDesignBy: 'Régicide conçu par Paul Abrahams, Luke Badger & Andy Richdale. Publié par Badgers from Mars et Iello.',
    noOfficialArt: 'Aucune illustration ou marque officielle utilisée. Jeu de 54 cartes traditionnel. 0 pub, 0 tracking.',
    connecting: 'Connexion...',
    handLimitsInfo: 'Solo (8 max) • 2 Joueurs (7 max) • 3 Joueurs (6 max) • 4 Joueurs (5 max)',
    rulesQuickRef: 'Règles',

    saveGameTitle: 'Sauvegarder la Partie ?',
    saveGameDesc: 'Voulez-vous enregistrer votre partie solo en cours pour la reprendre plus tard avec ce même pseudo ?',
    saveAndQuit: 'Sauvegarder & Quitter',
    quitWithoutSave: 'Quitter sans sauvegarder',
    cancel: 'Annuler',
    resumeSavedGame: 'Reprendre la Partie Sauvée',
    savedGameDetails: 'Ennemi : {rank} de {suit} • {cards} cartes en main',

    hearts: 'Cœurs',
    diamonds: 'Carreaux',
    clubs: 'Trèfles',
    spades: 'Piques',
    joker: 'Joker',

    jack: 'Valet',
    queen: 'Dame',
    king: 'Roi',
    ace: 'As',

    rankJackDisplay: 'V',
    rankQueenDisplay: 'D',
    rankKingDisplay: 'R',
    rankAceDisplay: 'A',

    logGameStarted: 'Partie démarrée avec {count} joueur(s). Premier ennemi : {rank} de {suit}',
    logShieldIncreased: 'Bouclier Pique augmenté de {amount} (Bouclier total : {total})',
    logPlayerPlayed: '{name} a joué {cards} infligeant {damage} dégâts.',
    logEnemyDefeated: '{rank} de {suit} a été vaincu et défaussé.',
    logPerfectExecution: 'EXÉCUTION PARFAITE ! {rank} de {suit} a été placé au-dessus du paquet Taverne.',
    logNewEnemyRevealed: 'Nouvel ennemi révélé : {rank} de {suit}.',
    logEnemyAttack: 'L’ennemi attaque pour {damage} dégâts ! {name} doit défausser des cartes.',
    logDiscarded: '{name} a défaussé {cards} (valeur {value}). Total : {total}/{required}',
    logPlayerPassed: '{name} a passé son tour.',
    logSoloJokerUsed: '{name} a utilisé un Joker Solo ! Main complétée à {count} cartes.',
    logJokerPlayed: '{name} a joué un Joker ! Immunité du {rank} annulée.',
    logTurnAssigned: 'Tour attribué à {name} suite au jeu d’un Joker.',
    logVictory: 'VICTOIRE ! Tous les 12 Rois et membres de la Cour ont été vaincus !',
    logGameOver: 'DÉFAITE ! {name} n’a pas pu encaisser la riposte ennemie.',
    logHeartHealed: 'Pouvoir Cœur : {count} carte(s) soignée(s) sous la Taverne.',
    logDiamondRecruited: 'Pouvoir Carreau : {count} carte(s) recrutée(s) parmi les joueurs.',
    logShieldBlocked: 'Attaque de l’ennemi complètement bloquée par le bouclier ! Le tour passe.',

    errNoCardsSelected: 'Aucune carte sélectionnée.',
    errJokerAlone: 'Le Joker doit être joué seul.',
    errAceComboInvalid: 'Impossible d’associer des As à plusieurs cartes différentes.',
    errComboSameRank: 'Les cartes d’un combo doivent toutes être du même rang.',
    errComboMaxSum: 'La valeur totale du combo ({sum}) dépasse la limite maximale de 10.',
    errNotYourTurn: 'Ce n’est pas votre tour.',
    errNotInPlayPhase: 'Pas en phase de jeu de cartes.',
    errPlayerNotFound: 'Joueur non trouvé.',
    errNoActiveEnemy: 'Aucun ennemi actif.',
    errNotWaitingJokerChoice: 'Pas en attente du choix de joueur du Joker.',
    errTargetPlayerNotFound: 'Joueur cible non trouvé.',
    errNotInDiscardPhase: 'Pas en phase de défausse de dégâts.',
    errCannotPassOutsidePlay: 'Impossible de passer en dehors de la phase de jeu.',
    errNotYourTurnPass: 'Ce n’est pas votre tour de passer.',
    errCannotPassConsecutive: 'Impossible de passer si tous les autres joueurs ont déjà passé consécutivement.',
    errSoloOnlyJoker: 'L’utilisation du Joker Solo est réservée au mode Solo.',
    errNoSoloJokersLeft: 'Aucun Joker Solo restant.',
    errFirebaseUnavailable: 'La base de données Firebase n’est pas configurée.',
    errRoomNotFound: 'Salon non trouvé. Vérifiez le code.',
    errGameAlreadyStarted: 'La partie a déjà commencé dans ce salon.',
    errRoomFull: 'Le salon est complet (max 4 joueurs).',

    rulesTitle: 'Livret de Règles Officiel & Guide du Jeu',
    rulesGoalTitle: 'Objectif du Jeu',
    rulesGoalDesc: 'Vaincre ensemble les 12 ennemis de la Cour Royale (4 Valets, 4 Dames, 4 Rois) empilés dans le Paquet Château, en résistant à leurs redoutables ripostes.',
    rulesEnemiesTitle: 'Les 12 Ennemis Royaux',
    rulesEnemiesDesc: 'Valets : 20 PV / 10 Attaque • Dames : 30 PV / 15 Attaque • Rois : 40 PV / 20 Attaque. Les ennemis sont révélés séquentiellement des Valets jusqu’aux Rois.',
    rulesTurnStructureTitle: 'Déroulement d’un Tour (4 Étapes)',
    rulesTurnStructureDesc: '1. Jouer une carte (ou combo) ou passer • 2. Appliquer le pouvoir de l’enseigne • 3. Infliger les dégâts & vérifier la défaite • 4. Encaisser la riposte en défaussant.',
    rulesSuitsTitle: 'Pouvoirs des Enseignes (Étape 2)',
    rulesHeartsDesc: '♥️ Cœur (Soin) : Mélange la défausse et remet autant de cartes que la valeur jouée sous le paquet Taverne.',
    rulesDiamondsDesc: '♦️ Carreau (Recruter) : Les joueurs piochent dans la Taverne, un par un dans le sens horaire, jusqu’à leur limite de main.',
    rulesClubsDesc: '♣️ Trèfle (Dégâts x2) : Double les dégâts d’attaque infligés à l’étape 3.',
    rulesSpadesDesc: '♠️ Pique (Bouclier) : Réduit l’attaque de l’ennemi pour l’étape 4. Les boucliers restent actifs jusqu’à la défaite de l’ennemi.',
    rulesImmunityTitle: 'Immunités des Ennemis & Jokers',
    rulesImmunityDesc: 'Chaque ennemi est immunisé au pouvoir de sa propre enseigne (ex: le Valet de Pique annule le bouclier Pique). Jouer un Joker annule l’immunité de l’ennemi actif !',
    rulesCombosTitle: 'Combinaisons (Combos)',
    rulesCombosDesc: 'Des cartes de même valeur peuvent être jouées ensemble si leur somme totale est <= 10 (ex: paire de 2, 3, 4, 5 ou brelan de 2, 3). Tous les pouvoirs s’appliquent !',
    rulesAcesTitle: 'As (Compagnons)',
    rulesAcesDesc: 'Un As (valeur 1) peut être joué avec n’importe quelle carte unique pour ajouter +1 dégât et déclencher un 2ème pouvoir ! Le pouvoir Cœur est TOUJOURS résolu AVANT Carreau.',
    rulesExecutionTitle: 'Exécution Parfaite vs Dégâts Excédentaires',
    rulesExecutionDesc: 'Si les PV d’un ennemi tombent à EXACTEMENT 0, l’ennemi est placé FACE CACHÉE AU-DESSUS de la Taverne (carte de renfort !). Si les dégâts sont excédentaires (PV < 0), il va à la Défausse.',
    rulesCounterTitle: 'Encaisser la Riposte Ennemie (Étape 4)',
    rulesCounterDesc: 'Si l’ennemi n’est pas vaincu, le joueur actif doit défausser des cartes de sa main au moins égales à l’attaque nette de l’ennemi (Atk moins boucliers). Ne pas pouvoir défausser la somme requise provoque la Défaite.',
    rulesPassingTitle: 'Passer son Tour',
    rulesPassingDesc: 'Un joueur peut passer son tour (sauf si tous les autres joueurs ont déjà passé consécutivement). Passer saute les étapes 2 & 3, mais le joueur DOIT tout de même subir la riposte à l’étape 4 !',
    close: 'Fermer',
  },
};
