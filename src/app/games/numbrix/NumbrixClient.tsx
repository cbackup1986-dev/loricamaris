"use client"

import React, { useState, useEffect } from 'react';
import { useNumbrixStore } from '@/store/useNumbrixStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Info } from 'lucide-react';
import Link from 'next/link';
import { recordPlay } from '@/app/actions/stats';

export default function NumbrixPage() {
  const { grid, initialGrid, gameStatus, size, setCellValue, resetGame } = useNumbrixStore();
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (grid.every(row => row.every(cell => cell === null))) {
      resetGame(5);
    }
  }, []);

  useEffect(() => {
    if (gameStatus === 'won') {
      recordPlay({
        gameId: 'numbrix',
        status: 'won',
        score: size * size * 10,
        level: size
      });
    }
  }, [gameStatus, size]);

  // Keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || gameStatus !== 'playing') return;
      
      const [r, c] = selectedCell;
      if (initialGrid[r][c] !== null) return;

      if (e.key >= '0' && e.key <= '9') {
        const currentVal = grid[r][c]?.toString() || '';
        const newVal = parseInt(currentVal + e.key);
        if (newVal <= size * size) {
          setCellValue(r, c, newVal);
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        const currentVal = grid[r][c]?.toString() || '';
        if (currentVal.length > 1) {
          setCellValue(r, c, parseInt(currentVal.slice(0, -1)));
        } else {
          setCellValue(r, c, null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, grid, gameStatus, size, setCellValue, initialGrid]);

  const handleNumpadClick = (num: number) => {
    if (!selectedCell || gameStatus !== 'playing') return;
    const [r, c] = selectedCell;
    if (initialGrid[r][c] !== null) return;
    
    const currentVal = grid[r][c]?.toString() || '';
    const newVal = parseInt(currentVal + num.toString());
    if (newVal <= size * size) {
      setCellValue(r, c, newVal);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] py-4 max-w-4xl mx-auto px-4 overflow-hidden">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-6">
        <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-tight uppercase">Numbrix</h2>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-0.5">
            Sequential Path
          </span>
        </div>
        <button onClick={() => resetGame(size)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center w-full">
        {/* Grid */}
        <div 
          className="grid gap-1.5 bg-slate-900 dark:bg-white p-1.5 rounded-xl shadow-2xl"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {grid.map((row, r) => 
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => setSelectedCell([r, c])}
                className={cn(
                  "w-11 h-11 md:w-14 md:h-14 flex items-center justify-center text-lg md:text-xl font-black cursor-pointer transition-all rounded-lg",
                  "bg-white dark:bg-slate-900",
                  initialGrid[r][c] !== null ? "text-slate-900 dark:text-white" : "text-indigo-600 dark:text-indigo-400",
                  selectedCell?.[0] === r && selectedCell?.[1] === c && "ring-[3px] ring-indigo-500 ring-inset bg-indigo-50 dark:bg-indigo-950/40"
                )}
              >
                {cell || ''}
              </div>
            ))
          )}
        </div>

        {/* Controls - Compact Numpad */}
        <div className="flex flex-col gap-4 w-full lg:w-44">
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumpadClick(num)}
                className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white font-black text-lg transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleNumpadClick(0)}
              className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white font-black text-lg transition-all active:scale-95"
            >
              0
            </button>
            <button
              onClick={() => {
                if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], null);
              }}
              className="h-10 col-span-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white font-bold text-xs transition-all active:scale-95"
            >
              Clear
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-tight">
            <Info size={12} className="shrink-0" /> 
            <div>Connect 1 to {size * size}. Select a cell and type or use pad.</div>
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {gameStatus === 'won' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-10 rounded-[2.5rem] shadow-2xl text-center space-y-8 max-w-sm w-full border-4 border-white/10"
          >
            <div className="inline-flex p-5 rounded-3xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40">
              <Trophy size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-black tracking-tight">Path Completed!</h3>
              <p className="text-muted-foreground font-medium">You've mastered the numbers.</p>
            </div>
            <button 
              onClick={() => resetGame(size)}
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
