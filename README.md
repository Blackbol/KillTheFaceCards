# 👑 KILL THE FACE CARDS

**Kill The Face Cards** is a 100% free, ad-free, open-source fan-made web adaptation based on the mechanics of the cooperative card game **Regicide** (designed by Paul Abrahams, Luke Badger & Andy Richdale, published by Badgers from Mars and Iello).

---

## 🗡️ Objective of the Game

Fight together through the **Castle Deck** to defeat all **12 members of the Royal Court** (4 Jacks, 4 Queens, 4 Kings) by unleashing suit powers, forming card combos, and enduring formidable counter-attacks!

### The 12 Royal Enemies
- **4 Jacks** : 20 HP / 10 Attack
- **4 Queens** : 30 HP / 15 Attack
- **4 Kings** : 40 HP / 20 Attack

---

## ✨ Key Features

- **⚔️ Real-Time Multiplayer Mode (1-4 Players)** :
  - Join or host rooms with 4-letter room codes using Firebase Realtime Database.
  - **F5 Auto-Reconnection** : Session tokens persisted in `localStorage` allow players to seamlessly rejoin their active room on page refresh.
  - **30-Second Disconnect Auto-Pause** : Real-time presence detection with synced live countdown timers. If the host stays offline for >30s, the room gracefully closes; if a non-host player drops, they are removed and the turn automatically advances.
  - **Host Controls** : Turn timer configuration, host unpause override, player kicking with presence node cleanup, and room rematches.

- **🎮 Official Regicide Solo Mode** :
  - Hand size limit set to **8 cards**.
  - **2 Solo Jokers** available to cancel active enemy suit immunity or instantly refill hand back up to 8 cards.
  - End-game medal grading system (**Gold, Silver, and Bronze Medals** based on Jokers used).

- **💾 Game State Save & Persistent Preferences** :
  - Prompted to save active solo games when leaving a match. Automatically detects saved games in the lobby.
  - Remembers user preferences (`SOLO`/`MULTIPLAYER` mode, `CREATE`/`JOIN` sub-tab, and hero name) in `localStorage`.

- **📱 Dual Responsive Interfaces (Pixel 7 & 1080p Desktop)** :
  - **24" 1080p Desktop View** : 3-column grid layout with zero vertical page scrolling (`h-screen overflow-hidden`).
  - **Smartphone View (Google Pixel 7)** : Pinned bottom action bar under the thumb (`sticky bottom-0`) and horizontal scrollable player hand with zero page scrolling (`100dvh`).

- **📜 Battle Log & Auto-Pass Timers** :
  - 6-line visible battle log viewport with 30-entry scrollable history.
  - Distinct battle log entries for timer auto-pass, random plays, and forced damage discards.

- **🌍 Bilingual English / French (i18n)** :
  - Seamless real-time language toggling (EN / FR).
  - Language preference persisted in local storage.

- **📜 Integrated Rulebook & Quick Reference** :
  - Complete official rules modal accessible anytime from the header button.

---

## 🃏 Suit Powers & Card Combinations

1. **♥️ Hearts (Heal)** : Shuffles discard pile and heals cards equal to the played value back to the bottom of the Tavern deck.
2. **♦️ Diamonds (Recruit)** : Draws cards equal to played value from the Tavern deck across players.
3. **♣️ Clubs (Double Damage)** : Doubles all attack damage dealt during Step 3.
4. **♠️ Spades (Shield)** : Reduces enemy attack damage for Step 4. Shields remain active until the current enemy is slain.

> **💡 Perfect Execution vs Excess Damage** :
> If an enemy's HP is reduced to **EXACTLY 0**, the enemy is placed **FACE DOWN on TOP of the Tavern Deck** (as a powerful recruit!). If HP < 0 (Excess Damage), it goes to the Discard pile.

---

## 🛠️ Tech Stack

- **Framework** : React 18 + TypeScript
- **Bundler** : Vite 5
- **Realtime Infrastructure** : Firebase Realtime Database (presence dictionary keys & state sync)
- **Styling** : Tailwind CSS (HSL custom Design System & responsive utilities)
- **Animations** : Framer Motion
- **Icons** : Lucide React
- **Unit Testing** : Vitest (30/30 test suite covering engine rules, lobby operations, and player disconnects)
- **Dev Tooling** : Custom dev-mode debug logger (`src/utils/debug.ts`)

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run unit test suite
npm test

# TypeScript type checking
npm run lint

# Production build
npm run build
```

---

## 📜 Legal Disclaimer

Unauthorised fan-made adaptation. No official artwork or trademarks used. Standard 54-card deck mechanics. 0 ads, 0 tracking.
