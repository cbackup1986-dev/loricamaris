"use client"

import React, { useEffect } from 'react';
import { useSudokuStore } from '@/store/useSudokuStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Info } from 'lucide-react';
import Link from 'next/link';
import { recordPlay } from '@/app/actions/stats';

export default function SudokuPage() {
  const { board, initialBoard, selectedCell, gameStatus, level, size, selectCell, setCellValue, resetGame, nextLevel } = useSudokuStore();

  useEffect(() => {
    if (board.every(row => row.every(cell => cell === null))) {
      resetGame();
    }
  }, []);

  useEffect(() => {
    if (gameStatus === 'won') {
      recordPlay({
        gameId: 'sudoku',
        status: 'won',
        level: level,
        score: level * 50
      });
    }
  }, [gameStatus, level]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (e.key >= '1' && e.key <= size.toString()) {
        setCellValue(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === '0') {
        setCellValue(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, setCellValue, size]);

  const numbers = Array.from({ length: size }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] py-4 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight uppercase">Sudoku</h2>
            <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-indigo-500/20">
              LEVEL {level}
            </span>
          </div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-0.5">
            {size}x{size} Grid
          </span>
        </div>
        <button onClick={() => resetGame()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center w-full">
        {/* Sudoku Grid */}
        <div 
          className={cn(
            "grid border-[3px] border-slate-900 dark:border-white shadow-2xl rounded-sm overflow-hidden bg-slate-900 dark:bg-white gap-[1.5px]",
            size === 4 ? "grid-cols-4" : size === 6 ? "grid-cols-6" : "grid-cols-9"
          )}
        >
          {board.map((row, r) => 
            row.map((cell, c) => {
              // Subgrid border logic
              const subW = size === 4 ? 2 : size === 6 ? 3 : 3;
              const subH = size === 4 ? 2 : size === 6 ? 2 : 3;
              
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => selectCell(r, c)}
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-lg md:text-xl font-bold cursor-pointer transition-all",
                    "bg-white dark:bg-slate-900",
                    initialBoard[r][c] !== null ? "text-slate-900 dark:text-white" : "text-indigo-600 dark:text-indigo-400",
                    selectedCell?.[0] === r && selectedCell?.[1] === c && "bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-inset ring-indigo-500",
                    (r % subH === subH - 1 && r !== size - 1) && "border-b-2 border-slate-900 dark:border-white",
                    (c % subW === subW - 1 && c !== size - 1) && "border-r-2 border-slate-900 dark:border-white"
                  )}
                >
                  {cell || ''}
                </div>
              );
            })
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-full lg:w-40">
          <div className={cn(
            "grid gap-1.5",
            size === 4 ? "grid-cols-2" : "grid-cols-3"
          )}>
            {numbers.map(num => (
              <button
                key={num}
                onClick={() => setCellValue(num)}
                className="h-10 md:h-12 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white font-black text-lg transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setCellValue(null)}
              className={cn(
                "h-10 md:h-12 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white font-bold text-xs transition-all active:scale-95",
                size === 4 ? "col-span-2" : "col-span-3"
              )}
            >
              Clear
            </button>
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
              <h3 className="text-4xl font-black tracking-tight">Level {level} Clear!</h3>
              <p className="text-muted-foreground font-medium">Excellent work! You've mastered this grid.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => nextLevel()}
                className="w-full brand-gradient text-white py-5 rounded-[1.5rem] font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-xl"
              >
                Next Level
              </button>
              <button 
                onClick={() => resetGame()}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-[1rem] font-bold text-sm hover:opacity-90 transition-all active:scale-95"
              >
                Replay Level
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mt-12 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
        <Info size={14} /> Level {level}: Solve the {size}x{size} grid
      </div>
    </div>
  );
}
