"use client"

/**
 * UserGameClient — Client wrapper that renders a user game
 * with its header, renderer, and metadata.
 */

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, User, Gamepad2, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { GameDefinition } from '@/sdk/types';
import { recordPlay } from '@/app/actions/stats';

const GameRenderer = dynamic(() => import('@/components/sdk/GameRenderer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 gap-3">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Engine</p>
    </div>
  )
});

interface UserGameClientProps {
  game: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    difficulty: string;
    username: string;
    viewCount: number;
  };
  definition: GameDefinition;
  script: string;
}

export default function UserGameClient({ game, definition, script }: UserGameClientProps) {
  const handleGameEnd = (result: { status: "won" | "lost"; score: number }) => {
    recordPlay({
      gameId: `user:${game.id}`,
      status: result.status,
      score: result.score,
      details: { title: game.title },
    });
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] py-2 md:py-4 max-w-2xl mx-auto px-2 md:px-4">
      {/* Game Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              {game.title}
            </h2>
            <span className={`px-1.5 py-0.5 text-white text-[8px] font-black rounded-full shadow-lg ${game.color}`}>
              {game.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <User size={10} className="text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground">{game.username}</span>
            </div>
            <span className="text-[8px] text-muted-foreground">•</span>
            <div className="flex items-center gap-1">
              <Activity size={10} className="text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground">{game.viewCount} Active Runs</span>
            </div>
          </div>
        </div>
        <div className="w-9" /> {/* Spacer for alignment */}
      </div>

      {/* Game Renderer */}
      <GameRenderer
        definition={definition}
        script={script}
        title={game.title}
        onGameEnd={handleGameEnd}
      />
    </div>
  );
}
