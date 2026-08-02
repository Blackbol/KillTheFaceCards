// 📁 src/components/__tests__/InterfaceLayout.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { GameBoard } from '../GameBoard';
import { EnemyCardView } from '../EnemyCardView';
import { HandView } from '../HandView';
import { ActionControls } from '../ActionControls';
import { RegicideEngine } from '../../engine/RegicideEngine';
import { I18nProvider } from '../../i18n/I18nContext';
import { GameState } from '../../types/game';

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe('UI Interface & Multi-Device Responsive Layout Test Suite', () => {
  let mockGameState: GameState;

  beforeEach(() => {
    mockGameState = RegicideEngine.createNewGame(
      'SOLO',
      [{ id: 'p1', name: 'Hero', isHost: true }],
      'SOLO'
    );
  });

  describe('1. PC Desktop Viewport Layout (1920x1080)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1080 });
      window.dispatchEvent(new Event('resize'));
    });

    it('renders top room header with player count and host crown badge', () => {
      renderWithI18n(<GameBoard gameState={mockGameState} activePlayerId="p1" />);
      const soloBadges = screen.getAllByText(/SOLO/i);
      expect(soloBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('Hero')).toBeInTheDocument();
    });

    it('renders Decks section with Tavern and Discard counts', () => {
      renderWithI18n(<GameBoard gameState={mockGameState} activePlayerId="p1" />);
      expect(screen.getByText('Tavern Deck')).toBeInTheDocument();
      expect(screen.getByText('Discard Pile')).toBeInTheDocument();
    });

    it('renders Enemy Boss Card with initial Jack of Clubs HP (20/20)', () => {
      renderWithI18n(<EnemyCardView enemy={mockGameState.currentEnemy} />);
      expect(screen.getByText('Jack')).toBeInTheDocument();
      expect(screen.getByText(/20 \/ 20/)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Jack attack damage
    });
  });

  describe('2. iPad 10th Gen Tablet Viewport Layout (810x1080)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 810 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1080 });
      window.dispatchEvent(new Event('resize'));
    });

    it('renders tablet GameBoard with top bar, decks column, and boss card', () => {
      renderWithI18n(<GameBoard gameState={mockGameState} activePlayerId="p1" />);
      expect(screen.getByText('Tavern Deck')).toBeInTheDocument();
      expect(screen.getByText('Discard Pile')).toBeInTheDocument();
      expect(screen.getByText('Jack')).toBeInTheDocument();
    });

    it('renders tablet hand view with full 8-card interactive capacity', () => {
      const activePlayer = mockGameState.players[0];
      renderWithI18n(
        <HandView
          hand={activePlayer.hand}
          selectedCardIds={[]}
          onToggleSelect={() => {}}
          currentEnemy={mockGameState.currentEnemy}
          gameState={mockGameState}
        />
      );

      const cardButtons = screen.getAllByRole('button');
      expect(cardButtons.length).toBe(8);
    });
  });

  describe('3. iPhone 16 Viewport Layout (393x852)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 393 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 852 });
      window.dispatchEvent(new Event('resize'));
    });

    it('renders compact Enemy Boss card with stacked Emblem, Immunity Badge, and HP Panel', () => {
      renderWithI18n(<EnemyCardView enemy={mockGameState.currentEnemy} />);

      // Check Emblem Circle ('J')
      expect(screen.getByText('J')).toBeInTheDocument();

      // Check Immunity badge ('Immune to')
      expect(screen.getByText('Immune to')).toBeInTheDocument();

      // Check HP Panel ('Health Points')
      expect(screen.getByText('Health Points')).toBeInTheDocument();
      expect(screen.getByText(/20 \/ 20/)).toBeInTheDocument();
    });

    it('renders Spade Shield Badge when active shield > 0', () => {
      if (mockGameState.currentEnemy) {
        mockGameState.currentEnemy.currentShield = 5;
      }
      renderWithI18n(<EnemyCardView enemy={mockGameState.currentEnemy} />);

      expect(screen.getByText(/Shield Active/i)).toBeInTheDocument();
    });

    it('renders iPhone 16 ActionControls with Attack, Pass, and Solo Joker buttons', () => {
      renderWithI18n(
        <ActionControls
          gameState={mockGameState}
          activePlayerId="p1"
          selectedCardIds={[]}
          onPlayCards={() => {}}
          onDiscardForDamage={() => {}}
          onPassTurn={() => {}}
          onUseSoloJoker={() => {}}
          onSelectJokerPlayer={() => {}}
          onClearSelection={() => {}}
        />
      );

      expect(screen.getByText(/ATTACK/i)).toBeInTheDocument();
      expect(screen.getByText(/Pass Turn/i)).toBeInTheDocument();
      expect(screen.getByText(/Use Solo Joker/i)).toBeInTheDocument();
    });
  });

  describe('4. Pixel 9 Viewport Layout (412x923)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 412 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 923 });
      window.dispatchEvent(new Event('resize'));
    });

    it('renders Pixel 9 Enemy Boss card with tightly stacked Emblem, Immunity Badge, and HP Panel', () => {
      renderWithI18n(<EnemyCardView enemy={mockGameState.currentEnemy} />);

      expect(screen.getByText('Jack')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText('Immune to')).toBeInTheDocument();
      expect(screen.getByText(/20 \/ 20/)).toBeInTheDocument();
    });

    it('renders Pixel 9 player hand view with 8 cards completely visible', () => {
      const activePlayer = mockGameState.players[0];
      renderWithI18n(
        <HandView
          hand={activePlayer.hand}
          selectedCardIds={[]}
          onToggleSelect={() => {}}
          currentEnemy={mockGameState.currentEnemy}
          gameState={mockGameState}
        />
      );

      const cardButtons = screen.getAllByRole('button');
      expect(cardButtons.length).toBe(8);
    });

    it('renders Pixel 9 ActionControls cleanly', () => {
      renderWithI18n(
        <ActionControls
          gameState={mockGameState}
          activePlayerId="p1"
          selectedCardIds={[]}
          onPlayCards={() => {}}
          onDiscardForDamage={() => {}}
          onPassTurn={() => {}}
          onUseSoloJoker={() => {}}
          onSelectJokerPlayer={() => {}}
          onClearSelection={() => {}}
        />
      );

      expect(screen.getByText(/ATTACK/i)).toBeInTheDocument();
      expect(screen.getByText(/Pass Turn/i)).toBeInTheDocument();
    });
  });

  describe('5. Pixel 10 Viewport Layout (412x915)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 412 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 915 });
      window.dispatchEvent(new Event('resize'));
    });

    it('renders Pixel 10 high-DPI Android layout with Boss Card & HP bar', () => {
      renderWithI18n(<EnemyCardView enemy={mockGameState.currentEnemy} />);

      expect(screen.getByText('Jack')).toBeInTheDocument();
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText(/20 \/ 20/)).toBeInTheDocument();
    });

    it('renders Pixel 10 player hand view with 8 cards completely visible', () => {
      const activePlayer = mockGameState.players[0];
      renderWithI18n(
        <HandView
          hand={activePlayer.hand}
          selectedCardIds={[]}
          onToggleSelect={() => {}}
          currentEnemy={mockGameState.currentEnemy}
          gameState={mockGameState}
        />
      );

      const cardButtons = screen.getAllByRole('button');
      expect(cardButtons.length).toBe(8);
    });

    it('renders Pixel 10 ActionControls cleanly', () => {
      renderWithI18n(
        <ActionControls
          gameState={mockGameState}
          activePlayerId="p1"
          selectedCardIds={[]}
          onPlayCards={() => {}}
          onDiscardForDamage={() => {}}
          onPassTurn={() => {}}
          onUseSoloJoker={() => {}}
          onSelectJokerPlayer={() => {}}
          onClearSelection={() => {}}
        />
      );

      expect(screen.getByText(/ATTACK/i)).toBeInTheDocument();
      expect(screen.getByText(/Pass Turn/i)).toBeInTheDocument();
    });
  });
});
