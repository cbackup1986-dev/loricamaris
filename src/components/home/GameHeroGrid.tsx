"use client"

import React from 'react';
import Link from 'next/link';
import { Type, Grid3X3, Shapes, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const MINI_GAMES = [
  { title: "Wordle", icon: <Type size={20} />, href: "/games/wordle", color: "from-indigo-500 to-purple-600" },
  { title: "Sudoku", icon: <Grid3X3 size={20} />, href: "/games/sudoku", color: "from-emerald-500 to-teal-600" },
  { title: "Nodes", icon: <Shapes size={20} />, href: "/games/connections", color: "from-indigo-600 to-blue-700" },
  { title: "Seqnc", icon: <Hash size={20} />, href: "/games/numbrix", color: "from-amber-500 to-orange-600" },
];

export function GameHeroGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
      {MINI_GAMES.map((game) => (
        <Link 
          key={game.title} 
          href={game.href}
          className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl overflow-hidden"
        >
          <div className={cn(
            "p-4 rounded-2xl bg-gradient-to-br text-white shadow-lg group-hover:shadow-indigo-500/50 transition-shadow",
            game.color
          )}>
            {game.icon}
          </div>
          <span className="text-white font-bold tracking-tight">{game.title}</span>
          
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
