// 📁 src/i18n/translations.ts

export type Language = 'en' | 'fr';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  room: string;
  mode: string;
  solo: string;
  multiplayer: string;
  create: string;
  join: string;
  startSolo: string;
  createRoom: string;
  joinRoom: string;
  playerName: string;
  playerPlaceholder: string;
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
  cards: string;
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
  allEnemiesSlain: string;
  legalFooter: string;
  regicideDesignBy: string;
  noOfficialArt: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'KILL THE FACE CARDS',
    appSubtitle: 'Cooperative Card Combat • Fan Adaptation of Regicide',
    room: 'ROOM',
    mode: 'MODE',
    solo: 'Solo',
    multiplayer: 'Multiplayer',
    create: 'Create',
    join: 'Join',
    startSolo: 'Start Solo Game',
    createRoom: 'Create Multiplayer Room',
    joinRoom: 'Join Room',
    playerName: 'Player Name',
    playerPlaceholder: 'Enter your hero name...',
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
    endureDamage: 'Endure Damage: {current} / {required} HP required',
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
    cards: 'cards',
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
    allEnemiesSlain: 'All Enemies Slain!',
    legalFooter: 'Kill The Face Cards is a 100% free, fan-made web adaptation based on the mechanics of the cooperative card game Regicide.',
    regicideDesignBy: 'Regicide original game design by Paul Abrahams, Luke Badger & Andy Richdale. Published by Badgers from Mars and Iello.',
    noOfficialArt: 'No official trademarks or artwork used. Standard 54-card deck mechanics. 0 ads, 0 tracking.',
  },
  fr: {
    appTitle: 'KILL THE FACE CARDS',
    appSubtitle: 'Combat de cartes coopératif • Adaptation Fan de Régicide',
    room: 'SALON',
    mode: 'MODE',
    solo: 'Solo',
    multiplayer: 'Multijoueur',
    create: 'Créer',
    join: 'Rejoindre',
    startSolo: 'Démarrer Partie Solo',
    createRoom: 'Créer un Salon Multijoueur',
    joinRoom: 'Rejoindre un Salon',
    playerName: 'Nom de Joueur',
    playerPlaceholder: 'Entrez votre nom de héros...',
    roomCode: 'Code de Salon à 4 Lettres',
    roomCodePlaceholder: 'ex: KNGS',
    tavernDeck: 'Paquet Taverne',
    discardPile: 'Défausse',
    castleDeckRemaining: 'Paquet Château : {count} ennemis restants',
    cardsPlayed: 'Cartes Jouées ce Tour',
    battleLog: 'Journal de Combat',
    yourTurn: 'À votre tour de jouer !',
    playerTurn: 'Tour de {name}',
    attack: 'Attaquer ({count} cartes)',
    passTurn: 'Passer son tour',
    useSoloJoker: 'Utiliser Joker Solo ({count} restant(s))',
    clear: 'Effacer',
    discardSelected: 'Défausser les cartes sélectionnées',
    endureDamage: 'Encaisser Dégâts : {current} / {required} PV requis',
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
    cards: 'cartes',
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
    allEnemiesSlain: 'Tous les Ennemis Vaincus !',
    legalFooter: 'Kill The Face Cards est une adaptation web fan-made 100 % gratuite basée sur les mécaniques du jeu coopératif Régicide.',
    regicideDesignBy: 'Régicide conçu par Paul Abrahams, Luke Badger & Andy Richdale. Publié par Badgers from Mars et Iello.',
    noOfficialArt: 'Aucune illustration ou marque officielle utilisée. Jeu de 54 cartes traditionnel. 0 pub, 0 tracking.',
  },
};
