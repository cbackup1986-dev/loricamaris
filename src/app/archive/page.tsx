"use client"

import React from 'react';
import Link from 'next/link';
import { GameCard } from '@/components/home/GameCard';
import { ChevronLeft, Grid, Filter } from 'lucide-react';

const ALL_GAMES = [
  {
    title: "Wordle",
    description: "Daily word puzzle challenge.",
    href: "/games/wordle",
    icon: <Grid />,
    color: "brand-gradient",
    difficulty: "Medium" as const
  },
  {
    title: "Logic Grid",
    description: "Master the Sudoku challenge.",
    href: "/games/sudoku",
    icon: <Grid />,
    color: "bg-emerald-500",
    difficulty: "Hard" as const
  },
  {
    title: "Nodes",
    description: "Identify hidden connections.",
    href: "/games/connections",
    icon: <Grid />,
    color: "bg-indigo-600",
    difficulty: "Easy" as const
  },
  {
    title: "Seqnc",
    description: "Numerical sequence challenge.",
    href: "/games/numbrix",
    icon: <Grid />,
    color: "bg-amber-500",
    difficulty: "Medium" as const
  }
];

export default function ArchivePage() {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-24 space-y-12">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-5xl font-black tracking-tight">The Archive</h1>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm">
                <Filter size={16} /> Filters
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {ALL_GAMES.map((game) => (
          <GameCard key={game.title} {...game} />
        ))}
      </div>
    </div>
  );
}
