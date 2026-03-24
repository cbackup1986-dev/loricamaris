"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Timer, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: Record<number, number>;
  };
}

export function StatisticsModal({ isOpen, onClose, stats }: StatisticsModalProps) {
  const winPercentage = stats.totalPlayed > 0 
    ? Math.round((stats.wins / stats.totalPlayed) * 100) 
    : 0;

  const guessDistribution = stats.guessDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const maxDistribution = Math.max(...Object.values(guessDistribution), 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card w-full max-w-sm rounded-[2rem] p-8 relative border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-wider">Statistics</h3>
                <div className="h-1 w-12 bg-indigo-500 rounded-full mx-auto" />
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-4 gap-4 w-full">
                <StatItem label="Played" value={stats.totalPlayed} icon={<Timer size={14} />} />
                <StatItem label="Win %" value={winPercentage} icon={<Target size={14} />} />
                <StatItem label="Current" value={stats.currentStreak} icon={<Zap size={14} />} />
                <StatItem label="Max" value={stats.maxStreak} icon={<Trophy size={14} />} />
              </div>

              {/* Guess Distribution */}
              <div className="w-full space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-left px-1">Guess Distribution</h4>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const count = guessDistribution[num] || 0;
                    const percentage = (count / maxDistribution) * 100;
                    
                    return (
                      <div key={num} className="flex items-center gap-3 w-full group">
                        <span className="text-[10px] font-black w-3 text-muted-foreground">{num}</span>
                        <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800/50 rounded-sm overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(percentage, 5)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: num * 0.1 }}
                            className={cn(
                              "h-full flex items-center justify-end px-2 transition-colors",
                              count > 0 ? "bg-indigo-500 text-white" : "bg-slate-300 dark:bg-slate-700 text-transparent"
                            )}
                          >
                            <span className="text-[10px] font-black">{count}</span>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatItem({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xl font-black tracking-tighter">{value}</div>
      <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
    </div>
  );
}
