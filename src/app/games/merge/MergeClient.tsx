"use client"

import React, { useEffect } from 'react';
import { useMergeStore, MergeItem, Order } from '@/store/useMergeStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Package, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { recordPlay } from '@/app/actions/stats';

const ITEM_DATA: Record<number, { name: string, icon: string, color: string, shadow: string }> = {
  1: { name: 'Seed', icon: '🌱', color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/30' },
  2: { name: 'Sprout', icon: '🌿', color: 'from-green-400 to-green-600', shadow: 'shadow-green-500/30' },
  3: { name: 'Clover', icon: '☘️', color: 'from-teal-400 to-teal-600', shadow: 'shadow-teal-500/30' },
  4: { name: 'Flower', icon: '🌸', color: 'from-pink-400 to-pink-600', shadow: 'shadow-pink-500/30' },
  5: { name: 'Fruit', icon: '🍎', color: 'from-rose-400 to-rose-600', shadow: 'shadow-rose-500/30' },
  6: { name: 'Gem', icon: '💎', color: 'from-indigo-400 to-violet-600', shadow: 'shadow-indigo-500/40' },
};

export default function MergePage() {
  const { grid, orders, level, xp, moveOrMerge, spawnItem, resetGame, fulfillOrder } = useMergeStore();
  const [hoveredCell, setHoveredCell] = React.useState<[number, number] | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (grid.every(row => row.every(cell => cell === null))) {
      resetGame();
    }
  }, []);

  useEffect(() => {
    if (level > 1) {
      recordPlay({
        gameId: 'merge',
        status: 'playing',
        level: level,
        score: xp
      });
    }
  }, [level]);

  const handleDragEnd = (event: any, info: any, from: [number, number]) => {
    setHoveredCell(null);
    if (!gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const x = info.point.x - gridRect.left;
    const y = info.point.y - gridRect.top;

    const cellSize = gridRect.width / 5;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      moveOrMerge(from, [row, col]);
    }
  };

  const handleDrag = (event: any, info: any) => {
    if (!gridRef.current) return;
    const gridRect = gridRef.current.getBoundingClientRect();
    const x = info.point.x - gridRect.left;
    const y = info.point.y - gridRect.top;
    const cellSize = gridRect.width / 5;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      setHoveredCell([row, col]);
    } else {
      setHoveredCell(null);
    }
  };

  const xpProgress = (xp / (level * 100)) * 100;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] py-4 max-w-6xl mx-auto px-4 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
      
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <Link href="/" className="p-3 hover:bg-white/80 dark:hover:bg-slate-800 backdrop-blur-md rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-800">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <h2 className="text-3xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              Merge Peak
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 text-white text-[11px] font-black rounded-full shadow-lg shadow-indigo-500/20">
              <Sparkles size={12} />
              LEVEL {level}
            </div>
          </motion.div>
          <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800/50">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1 }}
            />
          </div>
        </div>
        <button onClick={() => resetGame()} className="p-3 hover:bg-white/80 dark:hover:bg-slate-800 backdrop-blur-md rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-800">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start justify-center w-full max-w-5xl">
        {/* Left: Orders Panel */}
        <div className="flex flex-col gap-4 w-full lg:w-64">
          <div className="flex items-center gap-2 px-2 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
            <Package size={14} className="text-indigo-500" /> Active Orders
          </div>
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 no-scrollbar">
            <AnimatePresence>
              {orders.map((order) => {
                const item = ITEM_DATA[order.targetLevel];
                const gridCount = grid.flat().filter(i => i?.level === order.targetLevel).length;
                const isReady = gridCount >= order.count;

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ y: -4 }}
                    className={cn(
                      "flex-shrink-0 flex flex-col p-5 rounded-[2rem] border-2 transition-all cursor-default relative overflow-hidden group",
                      isReady 
                        ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/40 shadow-2xl shadow-emerald-500/10" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none"
                    )}
                  >
                    {/* Ticket Cutouts */}
                    <div className="absolute top-1/2 -left-2 w-4 h-4 bg-slate-50 dark:bg-slate-950 rounded-full border-r-2 border-slate-100 dark:border-slate-800 -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-2 w-4 h-4 bg-slate-50 dark:bg-slate-950 rounded-full border-l-2 border-slate-100 dark:border-slate-800 -translate-y-1/2" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/40 bg-gradient-to-br transition-all group-hover:rotate-6 duration-500",
                        item.color
                      )}>
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-[120px]">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Request</span>
                        <span className="text-base font-black text-slate-800 dark:text-white uppercase leading-none">{item.name}</span>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                className={cn("h-full transition-colors", isReady ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")}
                                animate={{ width: `${Math.min(100, (gridCount / order.count) * 100)}%` }}
                              />
                           </div>
                           <span className={cn(
                             "text-[10px] font-black tabular-nums",
                             isReady ? "text-emerald-500" : "text-slate-400"
                           )}>
                             {gridCount}/{order.count}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    {isReady && (
                      <motion.button 
                        layoutId={`fulfill-${order.id}`}
                        onClick={() => fulfillOrder(order.id)}
                        whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-6 py-3 bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/30 relative overflow-hidden group/btn"
                      >
                        <Sparkles size={14} className="group-hover/btn:rotate-12 transition-transform" /> 
                        Deliver Items
                        <motion.div 
                          className="absolute inset-0 bg-white/20" 
                          animate={{ x: ['100%', '-100%'] }} 
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.button>
                    )}
                    
                    {/* Reward Badge */}
                    <div className="absolute -top-1 -right-1 group-hover:scale-110 transition-transform">
                       <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[8px] font-black px-2 py-0.5 rounded-bl-xl border-l border-b border-amber-200 dark:border-amber-800/50 uppercase italic">
                         +{order.reward} XP
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Merge Grid */}
        <div className="relative group/grid">
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[3rem] blur-2xl group-hover/grid:bg-indigo-500/10 transition-colors duration-1000" />
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 md:p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none border border-white/50 dark:border-slate-800/50 relative">
            <div ref={gridRef} className="grid grid-cols-5 gap-3 md:gap-4 relative touch-none select-none">
              {grid.map((row, r) => 
                row.map((cell, c) => {
                  const isHovered = hoveredCell?.[0] === r && hoveredCell?.[1] === c;
                  
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={cn(
                        "w-14 h-14 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.75rem] flex items-center justify-center transition-all relative border-2",
                        "bg-slate-50/50 dark:bg-slate-950/50 border-slate-100/50 dark:border-slate-800/30 shadow-inner",
                        isHovered && "bg-indigo-500/10 border-indigo-500/40 border-dashed scale-105"
                      )}
                    >
                      <AnimatePresence>
                        {cell && (
                          <motion.div
                            key={cell.id}
                            layoutId={cell.id}
                            drag
                            dragSnapToOrigin
                            onDrag={handleDrag}
                            onDragEnd={(e, info) => handleDragEnd(e, info, [r, c])}
                            whileHover={{ scale: 1.05 }}
                            whileDrag={{ 
                              scale: 1.15, 
                              rotate: 5,
                              zIndex: 100,
                              boxShadow: "0 20px 40px rgba(0,0,0,0.15)" 
                            }}
                            initial={{ scale: 0, rotate: -15, opacity: 0 }}
                            animate={{ 
                              scale: 1, 
                              rotate: 0, 
                              opacity: 1,
                              y: [0, -2, 0] 
                            }}
                            exit={{ scale: 0.2, opacity: 0, filter: 'brightness(2) blur(10px)' }}
                            transition={{ 
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                              duration: 0.2,
                              y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                            }}
                            className={cn(
                              "w-full h-full rounded-[1.1rem] md:rounded-[1.5rem] flex items-center justify-center text-3xl md:text-5xl select-none cursor-grab active:cursor-grabbing z-50",
                              "bg-gradient-to-br shadow-lg border border-white/40 relative overflow-hidden",
                              ITEM_DATA[cell.level].color,
                              ITEM_DATA[cell.level].shadow,
                              cell.isMerged && "ring-4 ring-white/50 animate-pulse"
                            )}
                          >
                            <span className="relative z-10 drop-shadow-md group-active:scale-90 transition-transform">{ITEM_DATA[cell.level].icon}</span>
                            
                            {/* Glass Reflect */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                            
                            {/* Merge Success Burst */}
                            {cell.isMerged && (
                              <motion.div 
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                className="absolute inset-0 bg-white rounded-full pointer-events-none"
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & Tutorial */}
        <div className="flex flex-col gap-6 w-full lg:w-64">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => spawnItem()}
            className="group relative flex flex-col items-center justify-center gap-1 w-full p-8 rounded-[2rem] font-black text-white shadow-2xl transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 active:brightness-110" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            
            <TrendingUp size={32} className="relative z-10 mb-2 group-hover:rotate-12 transition-transform duration-500" />
            <span className="relative z-10 text-2xl tracking-tighter">SPAWN</span>
            <span className="relative z-10 text-[10px] opacity-60 font-bold uppercase tracking-widest mt-1">Free Item</span>
            
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[45deg] group-hover:animate-[shimmer_2s_infinite]" />
          </motion.button>
          
          <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
             <div className="flex items-center gap-2 mb-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
               <HelpCircle size={14} className="text-indigo-500" /> Tutorial
             </div>
             <ul className="space-y-4">
               {[
                 { text: "DRAG", highlight: "indigo", icon: "👆" },
                 { text: "MERGE", highlight: "purple", icon: "✨" },
                 { text: "ORDER", highlight: "emerald", icon: "🎯" }
               ].map((step, i) => (
                 <li key={i} className="flex items-start gap-3">
                   <span className="text-lg leading-none mt-0.5">{step.icon}</span>
                   <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-[1.4]">
                     <span className={cn(
                       "font-black uppercase tracking-tight",
                       step.highlight === "indigo" && "text-indigo-500",
                       step.highlight === "purple" && "text-purple-500",
                       step.highlight === "emerald" && "text-emerald-500"
                     )}>{step.text}</span> {
                       step.text === "DRAG" ? "items freely to organize your board" :
                       step.text === "MERGE" ? "identical items to evolve them up" :
                       "fulfill customer requests to level up!"
                     }
                   </p>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
