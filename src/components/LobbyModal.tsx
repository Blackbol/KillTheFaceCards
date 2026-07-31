// 📁 src/components/LobbyModal.tsx

import React, { useState } from 'react';
import { GameMode } from '../types/game';
import { Crown, Play } from 'lucide-react';

interface LobbyModalProps {
  onCreateGame: (playerName: string, mode: GameMode) => Promise<void>;
  onJoinGame: (roomCode: string, playerName: string) => Promise<boolean>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  onCreateGame,
  onJoinGame,
  isLoading,
  errorMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'SOLO' | 'CREATE' | 'JOIN'>('SOLO');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'SOLO') {
      await onCreateGame(playerName || 'Solo Knight', 'SOLO');
    } else if (activeTab === 'CREATE') {
      await onCreateGame(playerName || 'Host Commander', 'MULTIPLAYER');
    } else if (activeTab === 'JOIN') {
      if (roomCode.trim().length === 4) {
        await onJoinGame(roomCode, playerName || 'Challenger');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border-2 border-amber-600/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-2xl shadow-amber-950/40 flex flex-col gap-6 text-slate-100">
        {/* Title & Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <Crown size={32} />
          </div>
          <h1 className="text-3xl font-black font-cinzel text-amber-400 tracking-wider">
            KILL THE FACE CARDS
          </h1>
          <p className="text-xs text-slate-400">
            Cooperative Card Combat • Fan Adaptation of Regicide
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SOLO')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'SOLO'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Solo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CREATE')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'CREATE'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('JOIN')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'JOIN'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Join
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold px-4 py-2.5 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Player Name
            </label>
            <input
              type="text"
              placeholder="Enter your hero name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-medium"
              maxLength={20}
            />
          </div>

          {activeTab === 'JOIN' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                4-Letter Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. KNGS"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-amber-400 font-cinzel font-black uppercase tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                maxLength={4}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (activeTab === 'JOIN' && roomCode.trim().length !== 4)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black font-cinzel text-base py-3.5 rounded-xl shadow-xl shadow-amber-950/50 transition-all uppercase tracking-wider mt-2"
          >
            <Play size={20} className="fill-slate-950" />
            <span>
              {isLoading
                ? 'Connecting...'
                : activeTab === 'SOLO'
                ? 'Start Solo Game'
                : activeTab === 'CREATE'
                ? 'Create Multiplayer Room'
                : 'Join Room'}
            </span>
          </button>
        </form>

        {/* Footer Info */}
        <div className="text-[11px] text-slate-500 text-center space-y-1 border-t border-slate-900 pt-4">
          <p>Solo (8 cards limit) • 2 Players (7 limit) • 3 Players (6 limit) • 4 Players (5 limit)</p>
        </div>
      </div>
    </div>
  );
};
