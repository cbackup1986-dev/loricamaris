"use client"

import type { Metadata } from 'next';
import React, { useEffect } from 'react';
import { useWordleStore } from '@/store/useWordleStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RotateCcw, BarChart2, Info, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { StatisticsModal } from './components/StatisticsModal';
import { HelpModal } from './components/HelpModal';
import { SchemaOrg } from '@/components/common/SchemaOrg';
import { recordPlay } from '@/app/actions/stats';

// Metadata for SEO
const meta = {
  title: `Wordle - 每天免费在线解题练脑 | ${siteConfig.name}`,
  description: "挑战每日 Wordle 猜词游戏。每天一个新单词，免费在线解题，锻炼你的逻辑思维与词汇量。LoricaMaris 提供最流畅的猜词体验。",
  keywords: ["Wordle", "猜词游戏", "每天", "免费", "解题", "练脑", "逻辑拼图", "在线拼图"],
};

export default function WordlePage() {
  const { guesses, currentGuess, solution, gameStatus, level, wordLength, addLetter, removeLetter, submitGuess, resetGame, nextLevel, history } = useWordleStore();

  const [isShaking, setIsShaking] = React.useState(false);
  const [isStatsOpen, setIsStatsOpen] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  // Show help on first visit
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('wordle-help-seen');
    if (!hasSeenHelp) {
      setIsHelpOpen(true);
      localStorage.setItem('wordle-help-seen', 'true');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Backspace') removeLetter();
      if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addLetter, removeLetter, submitGuess, currentGuess, wordLength]);

  const handleSubmit = () => {
    if (currentGuess.length < wordLength) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    submitGuess();
  };

  useEffect(() => {
    if (gameStatus !== 'playing') {
      const timer = setTimeout(() => setIsStatsOpen(true), 1500);
      
      // Record the play
      recordPlay({
        gameId: 'wordle',
        status: gameStatus,
        score: gameStatus === 'won' ? (7 - guesses.length) * 100 : 0,
        details: { guesses, solution }
      });

      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  const rows = [...guesses];
  if (rows.length < 6) {
    rows.push(currentGuess.padEnd(wordLength, ' '));
  }
  while (rows.length < 6) {
    rows.push(' '.repeat(wordLength));
  }

  const handleShare = () => {
    const text = `${siteConfig.name} Wordle Level ${level} ${guesses.length}/6\n\n${guesses.map(g => 
        g.split('').map((l, i) => l === solution[i] ? '🟩' : solution.includes(l) ? '🟨' : '⬛').join('')
    ).join('\n')}`;
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!');
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-120px)] py-2 md:py-4 max-w-2xl mx-auto px-2 md:px-4">
      {/* Game Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <Link href="/" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-[0.1em] uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              Wordle
            </h2>
            <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[8px] font-black rounded-full shadow-lg">
              LV {level}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{wordLength} Letters</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-indigo-500"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={() => setIsStatsOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-indigo-500"
          >
            <BarChart2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Wordle Grid */}
      <div 
        className={cn(
          "grid grid-rows-6 gap-1 md:gap-1.5 w-full mb-3 md:mb-4",
          wordLength === 4 ? "max-w-[180px] md:max-w-[200px] aspect-[4/6]" : "max-w-[220px] md:max-w-[250px] aspect-[5/6]"
        )}
      >
        {rows.map((row, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          
          return (
            <motion.div 
              key={rowIndex}
              animate={isCurrentRow && isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "grid gap-1.5",
                wordLength === 4 ? "grid-cols-4" : "grid-cols-5"
              )}
            >
              {row.split('').map((letter, colIndex) => {
                const isGuessed = rowIndex < guesses.length;
                const isActive = isCurrentRow && colIndex === currentGuess.length;
                let status = 'default';
                
                if (isGuessed) {
                  if (letter === solution[colIndex]) status = 'correct';
                  else if (solution.includes(letter)) status = 'present';
                  else status = 'absent';
                }

                return (
                  <motion.div
                    key={colIndex}
                    initial={false}
                    animate={status !== 'default' ? { rotateY: 180 } : letter !== ' ' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ 
                      rotateY: { delay: colIndex * 0.1, duration: 0.5 },
                      scale: { duration: 0.1 }
                    }}
                    className="relative preserve-3d h-full w-full"
                  >
                    <div
                      className={cn(
                        "game-grid-cell w-full h-full rounded-md border-[1.5px] uppercase select-none transition-all duration-300 flex items-center justify-center font-black text-sm md:text-base relative",
                        status === 'default' && (letter !== ' ' 
                          ? "border-slate-800 dark:border-white scale-100 shadow-sm" 
                          : "border-slate-200 dark:border-slate-800 shadow-sm"),
                        status === 'correct' && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20",
                        status === 'present' && "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20",
                        status === 'absent' && "bg-slate-600 border-slate-600 text-white opacity-40 shadow-none",
                        status !== 'default' && "backface-hidden",
                        isActive && "border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/30 scale-105 z-10"
                      )}
                    >
                      {letter}
                      {isActive && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute -bottom-1 left-1.5 right-1.5 h-0.5 bg-indigo-500 rounded-full"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Virtual Keyboard */}
      <div className="w-full max-w-[450px] mb-3 md:mb-4 select-none px-1">
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BS']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1 mb-1.5">
            {row.map((key) => {
              const displayKey = key === 'BS' ? 'BACKSPACE' : key;
              const isSpecial = displayKey.length > 1;
              
              let keyStatus = 'default';
              const allGuessedLetters = guesses.join('');
              if (allGuessedLetters.includes(displayKey)) {
                if (guesses.some(g => g.split('').some((l, idx) => l === displayKey && solution[idx] === l))) {
                  keyStatus = 'correct';
                } else if (solution.includes(displayKey)) {
                  keyStatus = 'present';
                } else {
                  keyStatus = 'absent';
                }
              }

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (displayKey === 'ENTER') handleSubmit();
                    else if (displayKey === 'BACKSPACE') removeLetter();
                    else addLetter(displayKey);
                  }}
                  className={cn(
                    "flex items-center justify-center rounded-[6px] font-bold transition-all active:scale-90",
                    isSpecial ? "flex-[1.5] h-11 md:h-11 text-[9px]" : "flex-1 h-11 md:h-11 text-xs md:text-sm",
                    keyStatus === 'default' && "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
                    keyStatus === 'correct' && "bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
                    keyStatus === 'present' && "bg-amber-500 text-white shadow-md shadow-amber-500/20",
                    keyStatus === 'absent' && "bg-slate-600 text-white opacity-40"
                  )}
                >
                  {displayKey === 'BACKSPACE' ? <RotateCcw size={14} className="rotate-90" /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modern Controls */}
      <div className="flex flex-col gap-4 w-full items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => resetGame()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold transition-all active:scale-95 text-xs"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 text-xs"
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* Win/Loss Modal */}
      <AnimatePresence>
        {gameStatus !== 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-6"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-card p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] text-center space-y-8 max-w-sm w-full border-4 border-white/10"
            >
              <div className="inline-flex p-5 rounded-3xl brand-gradient text-white shadow-2xl shadow-indigo-500/40">
                {gameStatus === 'won' ? <Trophy size={40} /> : <Info size={40} />}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-black tracking-tight">
                  {gameStatus === 'won' ? `Level ${level} Clear!` : 'Close Effort'}
                </h3>
                <p className="text-muted-foreground font-medium">
                  The word was <span className="font-extrabold text-foreground tracking-widest uppercase ml-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{solution}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                {gameStatus === 'won' ? (
                  <button 
                    onClick={() => nextLevel()}
                    className="w-full brand-gradient text-white py-5 rounded-[1.5rem] font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-xl"
                  >
                    Next Level
                  </button>
                ) : (
                  <button 
                    onClick={() => resetGame()}
                    className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-5 rounded-[1.5rem] font-black text-lg hover:opacity-90 transition-all active:scale-95 shadow-xl"
                  >
                    Try Again
                  </button>
                )}
                <button 
                  onClick={() => resetGame()}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-[1rem] font-bold text-sm hover:opacity-90 transition-all active:scale-95"
                >
                  Replay Level
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatisticsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
        stats={history} 
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />

      <SchemaOrg 
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "如何玩 Wordle",
          "description": "Wordle 是一个每天更新的猜词游戏，玩家有 6 次机会猜出一个 5 位字母的单词。",
          "step": [
            {
              "@type": "HowToStep",
              "text": "输入任何一个有效的 5 字母单词。"
            },
            {
              "@type": "HowToStep",
              "text": "查看颜色反馈：绿色代表位置正确，黄色代表字母存在但位置不对，灰色代表单词中没有该字母。"
            },
            {
              "@type": "HowToStep",
              "text": "根据反馈在 6 次尝试内猜出正确单词。"
            }
          ]
        }}
      />

      <SchemaOrg 
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Wordle 是免费的吗？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "是的，在 LoricaMaris 上，你可以每天免费玩 Wordle 游戏。"
              }
            },
            {
              "@type": "Question",
              "name": "每天有多少个单词？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "每天都有一个新的关卡和单词供你挑战。"
              }
            }
          ]
        }}
      />

      <style jsx global>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

function Trophy({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
