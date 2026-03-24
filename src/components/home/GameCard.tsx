"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWordleStore } from '@/store/useWordleStore';
import { useSudokuStore } from '@/store/useSudokuStore';

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  isDaily?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Standard';
  type?: 'GAME' | 'REPORT' | 'SYSTEM' | 'APP';
}

export const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  description, 
  href, 
  icon, 
  color,
  isDaily = false,
  difficulty = 'Medium',
  type = 'GAME'
}) => {
  const wordleLevel = useWordleStore(state => state.level);
  const sudokuLevel = useSudokuStore(state => state.level);

  const level = title === "Wordle" ? wordleLevel : title === "Logic Grid" ? sudokuLevel : undefined;
  return (
    <Link href={href} className="group relative block h-full">
      <div className={cn(
        "relative overflow-hidden rounded-[2rem] border-2 bg-card p-8 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2",
        "border-slate-200 dark:border-slate-800 group-hover:border-primary/40"
      )}>
        {/* Decorative background glow */}
        <div className={cn(
          "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          color.indexOf('bg-') === 0 ? color : 'bg-indigo-500'
        )} />
        
        <div className="flex justify-between items-start mb-6">
          <div className={cn("inline-flex p-4 rounded-2xl text-white shadow-xl shadow-current/10", color)}>
            {icon && React.isValidElement(icon) ? (
              React.cloneElement(icon as any, { size: 28 })
            ) : (
              <Trophy size={28} />
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1.5 text-right">
            <span className={cn(
              "text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.15em] shadow-sm",
               type === 'GAME' ? "bg-indigo-500 text-white" :
               type === 'SYSTEM' ? "bg-emerald-500 text-white" :
               type === 'APP' ? "bg-amber-500 text-white" :
               "bg-slate-500 text-white"
            )}>
              {type}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {isDaily && (
                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-500/20">
                  Daily
                </span>
              )}
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
                difficulty === 'Easy' ? "border-emerald-500/20 text-emerald-500" :
                difficulty === 'Medium' ? "border-amber-500/20 text-amber-500" :
                "border-rose-500/20 text-rose-500"
              )}>
                {difficulty}
              </span>
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-extrabold mb-3 group-hover:text-primary transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          {description}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-card bg-slate-200 dark:bg-slate-700" />
              ))}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Now</span>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-45 shadow-sm">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
};
