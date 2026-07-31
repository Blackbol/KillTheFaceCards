# Kill The Face Cards ⚔️🎴

> **Kill The Face Cards** is a 100% free, open-source, fan-made web adaptation of the cooperative card game **Regicide**. Play solo or with 2 to 4 players online in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![Vite](https://img.shields.io/badge/Vite-5.2-purple)
![Firebase](https://img.shields.io/badge/Firebase-RTDB-amber)

---

## 🌟 Key Features

- 🎮 **Solo & Online Multiplayer Mode**: Play solo with custom 8-card limit rules & medals, or play online with 2 to 4 players using a simple 4-letter room code (e.g. `KNGS`).
- ⚡ **Pure TypeScript Engine**: Pure, deterministic game engine (`RegicideEngine.ts`) 100% decoupled from React UI components and network sync.
- 📡 **Real-time Firebase Synchronization**: Instant multi-client game state updates using Firebase Realtime Database.
- 🎨 **Modern Motion UI**: Dark-mode interface powered by Tailwind CSS and Framer Motion micro-animations.
- 🔒 **Zero Ads & Zero Account Required**: Fully open-source and privacy-friendly.

---

## 🃏 Game Rules & Mechanics

The goal is to defeat all 12 members of the Royal Court (4 Jacks, 4 Queens, and 4 Kings) stacked in the **Castle Deck**.

### Player Hand Limits
- **1 Player (Solo)**: 8 cards
- **2 Players**: 7 cards
- **3 Players**: 6 cards (1 Joker in Tavern deck)
- **4 Players**: 5 cards (2 Jokers in Tavern deck)

### Suit Powers
- **♥️ Hearts (Heal)**: Shuffles the discard pile and moves cards equal to the attack value to the bottom of the Tavern deck.
- **♦️ Diamonds (Recruit)**: Players draw cards from the Tavern deck clockwise up to their hand limits.
- **♣️ Clubs (Double Damage)**: Doubles the attack damage dealt in Step 3.
- **♠️ Spades (Shield)**: Reduces the active enemy's counter-attack value. Shields persist across turns until the enemy is slain.

*(Rulebook Note: When Hearts and Diamonds are played together, Hearts power is resolved BEFORE Diamonds power).*

### Combos & Aces
- **Single Cards**: Play any value 1–10 or recruited court cards (J=10, Q=15, K=20).
- **Aces**: Can be paired with a card to add +1 attack value and grant a second suit power.
- **Combos**: Sets of identical numerical ranks whose total sum is **<= 10** (e.g., Pair of 5s, Triple 3s, Quad 2s).

### Enemy Defeat & Overkill
- **Perfect Execution (Exact HP = 0)**: Defeated enemy is placed **face down on top of the Tavern deck**.
- **Overkill (HP < 0)**: Defeated enemy is placed in the Discard pile.
- The player who delivers the killing blow takes an immediate additional turn against the next enemy.

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js (v18+)
- npm / pnpm / yarn

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/killthefacecards.git
cd killthefacecards

# 2. Install dependencies
npm install

# 3. Create .env file from template
cp .env.example .env

# 4. Start Vite development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🛠️ Tech Stack & Project Architecture

```
src/
├── assets/          # Static assets & images
├── components/      # React UI components (GameBoard, EnemyCard, HandView, etc.)
├── engine/          # Pure TypeScript Regicide Engine (RegicideEngine.ts)
├── hooks/           # Custom React state hooks (useGameRoom.ts)
├── services/        # Firebase Realtime Database sync service (firebase.ts)
└── types/           # Strict TypeScript domain interfaces (game.ts)
```

- **Framework**: React 18
- **Language**: TypeScript (Strict Mode)
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS + Framer Motion
- **Database / Sync**: Firebase Realtime Database (SDK v10)

---

## ⚖️ Legal Attribution & Disclaimer

**Kill The Face Cards** is an unofficial, 100% free fan-made web implementation created solely using traditional 54-card deck mechanics (52 cards + 2 Jokers).

- Original **Regicide** game design by **Paul Abrahams, Luke Badger, and Andy Richdale**.
- Original game published by **Badgers from Mars** and **Iello**.
- No official artwork, logos, or registered trademarks are used in this project.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
