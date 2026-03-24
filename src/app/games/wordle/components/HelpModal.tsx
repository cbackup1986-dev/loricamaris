"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
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
            className="bg-card w-full max-w-sm rounded-[2rem] p-8 relative border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col space-y-6">
              <div className="space-y-1 text-center">
                <h3 className="text-2xl font-black uppercase tracking-wider">How to Play</h3>
                <div className="h-1 w-12 bg-indigo-500 rounded-full mx-auto" />
              </div>

              <div className="space-y-4 text-sm font-medium text-muted-foreground leading-relaxed">
                <p>Guess the <span className="text-foreground font-black uppercase">Wordle</span> in 6 tries.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Each guess must be a valid 5-letter word.</li>
                  <li>The color of the tiles will change to show how close your guess was to the word.</li>
                </ul>
              </div>

              {/* Examples */}
              <div className="space-y-6 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Examples</h4>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <LetterCell letter="W" status="correct" />
                    <LetterCell letter="O" />
                    <LetterCell letter="R" />
                    <LetterCell letter="D" />
                    <LetterCell letter="S" />
                  </div>
                  <p className="text-xs text-muted-foreground"><span className="text-emerald-500 font-bold">W</span> is in the word and in the correct spot.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <LetterCell letter="L" />
                    <LetterCell letter="I" status="present" />
                    <LetterCell letter="G" />
                    <LetterCell letter="H" />
                    <LetterCell letter="T" />
                  </div>
                  <p className="text-xs text-muted-foreground"><span className="text-amber-500 font-bold">I</span> is in the word but in the wrong spot.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <LetterCell letter="R" />
                    <LetterCell letter="O" />
                    <LetterCell letter="A" />
                    <LetterCell letter="D" status="absent" />
                    <LetterCell letter="S" />
                  </div>
                  <p className="text-xs text-muted-foreground"><span className="text-slate-400 font-bold">D</span> is not in the word in any spot.</p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full brand-gradient text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LetterCell({ letter, status = 'default' }: { letter: string, status?: 'default' | 'correct' | 'present' | 'absent' }) {
  return (
    <div className={cn(
      "w-10 h-10 rounded-md border-2 flex items-center justify-center font-black text-lg uppercase transition-all",
      status === 'default' && "border-slate-100 dark:border-slate-800 text-foreground",
      status === 'correct' && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20",
      status === 'present' && "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20",
      status === 'absent' && "bg-slate-600 border-slate-600 text-white opacity-40 shadow-none border-none"
    )}>
      {letter}
    </div>
  );
}
