"use client"

import React, { useEffect } from 'react';
import { useConnectionsStore } from '@/store/useConnectionsStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Info, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { recordPlay } from '@/app/actions/stats';

export default function ConnectionsPage() {
  const { 
    words, selectedWords, solvedGroups, mistakesRemaining, gameStatus,
    toggleWord, submitGuess, shuffleWords, resetGame 
  } = useConnectionsStore();

  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      recordPlay({
        gameId: 'connections',
        status: gameStatus,
        score: gameStatus === 'won' ? (mistakesRemaining + 1) * 25 : 0,
        details: { solvedGroups }
      });
    }
  }, [gameStatus, mistakesRemaining, solvedGroups]);

  const levelColors = {
    1: 'bg-yellow-400 dark:bg-yellow-500',
    2: 'bg-emerald-400 dark:bg-emerald-500',
    3: 'bg-indigo-400 dark:bg-indigo-500',
    4: 'bg-purple-400 dark:bg-purple-500'
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] py-4 max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-tight uppercase">Connections</h2>
          <div className="flex gap-1.5 mt-1.5">
            {Array(4).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-500",
                  i < mistakesRemaining ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-slate-800"
                )} 
              />
            ))}
          </div>
        </div>
        <button onClick={resetGame} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Solved Groups */}
      <div className="w-full space-y-1.5 mb-1.5">
        {solvedGroups.map((group, i) => (
          <motion.div 
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-full py-4 rounded-xl text-center text-slate-900 font-black uppercase tracking-widest text-xs md:text-sm px-4",
              levelColors[group.level as keyof typeof levelColors]
            )}
          >
            <div className="text-[9px] mb-0.5 opacity-60">{group.category}</div>
            {group.words.join(', ')}
          </motion.div>
        ))}
      </div>

      {/* Active Word Grid */}
      <div className="grid grid-cols-4 gap-1.5 w-full mb-6">
        {words.map((word) => (
          <button
            key={word}
            onClick={() => toggleWord(word)}
            className={cn(
              "aspect-square rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black p-1.5 transition-all active:scale-95 text-center overflow-hidden break-all",
              selectedWords.includes(word)
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-[0.98]"
                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 w-full items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={shuffleWords}
            className="p-3 rounded-full border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          >
            <Shuffle size={18} />
          </button>
          <button 
            onClick={submitGuess}
            disabled={selectedWords.length !== 4 || gameStatus !== 'playing'}
            className={cn(
              "px-8 py-3 rounded-full font-black text-base transition-all",
              selectedWords.length === 4 && gameStatus === 'playing'
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 scale-105"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            )}
          >
            Submit
          </button>
          <div className="p-3 w-[46px] h-[46px] opacity-0 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          <Info size={12} /> Find groups of four with a common link
        </div>
      </div>

      {/* Game Over Modal */}
      {(gameStatus === 'won' || gameStatus === 'lost') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-10 rounded-[2.5rem] shadow-2xl text-center space-y-8 max-w-sm w-full border-4 border-white/10"
          >
            <div className={cn(
              "inline-flex p-5 rounded-3xl text-white shadow-2xl",
              gameStatus === 'won' ? "bg-emerald-500 shadow-emerald-500/40" : "bg-rose-500 shadow-rose-500/40"
            )}>
              {gameStatus === 'won' ? <Trophy size={40} /> : <Info size={40} />}
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black tracking-tight">
                {gameStatus === 'won' ? 'Brilliant!' : 'Game Over'}
              </h3>
              <p className="text-muted-foreground font-medium">
                {gameStatus === 'won' 
                  ? "You've found all connections." 
                  : "Try again to find the hidden links."}
              </p>
            </div>
            <button 
              onClick={resetGame}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[1.5rem] font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-xl"
            >
              New Game
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
