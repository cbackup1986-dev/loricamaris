"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, History, LayoutGrid, Loader2, Lock } from 'lucide-react';
import { getGlobalStats } from '@/app/actions/stats';
import { cn } from '@/lib/utils';

interface GlobalStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export function GlobalStatisticsModal({ isOpen, onClose, session }: GlobalStatisticsModalProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'history'>('leaderboard');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getGlobalStats().then(data => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0f1e]/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="bg-[#1a233b] w-full max-w-lg rounded-[2rem] relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all z-20"
            >
              <X size={20} />
            </button>

            <div className="px-10 py-12 flex flex-col overflow-y-auto scrollbar-hide">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-[#7c5bf0] rounded-xl flex items-center justify-center shadow-lg shadow-[#7c5bf0]/30 transition-transform hover:rotate-6">
                  <LayoutGrid className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">Operational Intel</h3>
              </div>

              <div className="flex bg-[#252d48] p-1.5 rounded-2xl mb-10 border border-white/5">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'leaderboard' ? "bg-[#714ef2] text-white shadow-xl" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <Trophy size={14} /> Rankings
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === 'history' ? "bg-[#714ef2] text-white shadow-xl" : "text-white/30 hover:text-white/50"
                  )}
                >
                  <History size={14} /> Mission Logs
                </button>
              </div>

              <div className="flex-1 space-y-8 min-h-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Retrieving Data...</p>
                  </div>
                ) : activeTab === 'leaderboard' ? (
                  <div className="space-y-10">
                    {/* Wordle */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Wordle Top Operatives</h4>
                      </div>
                      <div className="grid gap-2">
                        {stats?.leaderboards.wordle.length > 0 ? stats.leaderboards.wordle.map((rc: any, i: number) => (
                          <div key={rc.id} className="flex items-center justify-between px-6 py-5 bg-[#252d48]/50 hover:bg-[#252d48] rounded-2xl border border-white/5 transition-colors group">
                            <div className="flex items-center gap-5">
                              <span className={cn(
                                "text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg border",
                                i === 0 ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : 
                                "bg-white/5 border-white/10 text-white/40"
                              )}>{i + 1}</span>
                              <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{rc.user?.username || 'Unknown'}</span>
                            </div>
                            <div className="flex flex-col items-end leading-none">
                              <span className="text-sm font-black text-indigo-400 tabular-nums">{rc.score}</span>
                              <span className="text-[8px] font-black uppercase text-white/20 tracking-tighter mt-1">Points</span>
                            </div>
                          </div>
                        )) : (
                          <p className="text-[10px] text-center py-10 text-white/20 font-black uppercase tracking-widest bg-black/20 rounded-3xl border border-dashed border-white/10">No records found</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!session ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-black/20 rounded-[2rem] border border-dashed border-white/10">
                        <Lock size={32} className="text-white/20" />
                        <div className="space-y-2 px-12">
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Encryption Active</p>
                          <p className="text-[10px] text-white/30 font-bold leading-relaxed">Please authenticate to access mission logs.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {stats?.personalRecords.length > 0 ? stats.personalRecords.map((rc: any) => (
                          <div key={rc.id} className="flex items-center justify-between px-6 py-5 bg-[#252d48]/50 rounded-2xl border border-white/5">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">{rc.gameId}</span>
                              <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">{new Date(rc.playedAt).toLocaleDateString()}</span>
                            </div>
                            <div className={cn(
                              "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-lg border",
                              rc.status === 'won' 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                : "bg-white/5 border-white/10 text-white/30"
                            )}>
                              {rc.status}
                            </div>
                          </div>
                        )) : (
                          <p className="text-[10px] text-center py-16 text-white/20 font-black uppercase tracking-widest bg-black/20 rounded-3xl border border-dashed border-white/10">No missions logged</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
