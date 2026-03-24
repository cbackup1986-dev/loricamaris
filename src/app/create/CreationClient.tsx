"use client"

/**
 * Creation Center Client component
 * 
 * Handles interaction logic for publishing and deleting user games.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Trash2, 
  Globe, 
  EyeOff, 
  Gamepad2, 
  Clock, 
  ArrowRight,
  Loader2,
  AlertCircle,
  BarChart,
  FileText,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserGame {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  difficulty: string | null;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
}

interface CreationClientProps {
  initialGames: UserGame[];
  userId: string;
  username: string;
}

export default function CreationClient({ initialGames, userId, username }: CreationClientProps) {
  const [games, setGames] = useState<UserGame[]>(initialGames);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const togglePublish = async (gameId: string) => {
    setLoadingId(gameId);
    try {
      const res = await fetch(`/api/games/${gameId}`, { method: 'PATCH' });
      if (res.ok) {
        const { isPublished } = await res.json();
        setGames(prev => prev.map(g => g.id === gameId ? { ...g, isPublished } : g));
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const deleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this work? This action cannot be undone.')) return;
    
    setLoadingId(gameId);
    try {
      const res = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
      if (res.ok) {
        setGames(prev => prev.filter(g => g.id !== gameId));
      }
    } catch (err) {
      console.error('Failed to delete game:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const [token, setToken] = useState<string | null>(null);
  const [tokenLastUsed, setTokenLastUsed] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const fetchToken = async () => {
    setTokenLoading(true);
    try {
      const res = await fetch('/api/auth/token');
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setTokenLastUsed(data.lastUsed);
      }
    } catch (err) {
      console.error('Failed to fetch token:', err);
    } finally {
      setTokenLoading(false);
    }
  };

  const generateToken = async () => {
    if (token && !confirm('Generating a new token will revoke your existing one. Continue?')) return;
    setTokenLoading(true);
    try {
      const res = await fetch('/api/auth/token', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setShowToken(true);
      }
    } catch (err) {
      console.error('Failed to generate token:', err);
    } finally {
      setTokenLoading(false);
    }
  };

  const revokeToken = async () => {
    if (!confirm('Are you sure you want to revoke your developer token? AI agents will no longer be able to publish games.')) return;
    setTokenLoading(true);
    try {
      const res = await fetch('/api/auth/token', { method: 'DELETE' });
      if (res.ok) {
        setToken(null);
        setShowToken(false);
      }
    } catch (err) {
      console.error('Failed to revoke token:', err);
    } finally {
      setTokenLoading(false);
    }
  };

  React.useEffect(() => {
    fetchToken();
  }, []);

  return (
    <div className="space-y-8">
      {/* Developer API Settings */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 dark:bg-slate-800 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black flex items-center gap-2">
              OpenClaw API <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">SDK V2</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-md">
              Use your Developer Token to deploy logic modules directly from your AI assistant.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {token ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <code className="text-xs font-mono text-indigo-300">
                    {showToken ? token : token}
                  </code>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(token);
                        alert('Token copied to clipboard!');
                    }}
                    className="ml-2 text-[10px] font-bold uppercase hover:text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                {tokenLastUsed && (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Last Used: {new Date(tokenLastUsed).toLocaleString()}
                  </span>
                )}
                <div className="flex gap-2">
                  <button onClick={generateToken} disabled={tokenLoading} className="text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-colors">Rotate Key</button>
                  <button onClick={revokeToken} disabled={tokenLoading} className="text-[10px] font-bold uppercase text-red-400 hover:text-red-300 transition-colors">Revoke</button>
                </div>
              </div>
            ) : (
              <button
                onClick={generateToken}
                disabled={tokenLoading}
                className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {tokenLoading ? 'Generating...' : 'Enable Developer Access'}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Games List */}
      {games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
            <Activity size={40} className="text-slate-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">No works yet</h3>
            <p className="text-muted-foreground text-sm">Deploy your first module using the LoricaMaris SDK API.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {games.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg font-black", game.color || "bg-indigo-500")}>
                    {game.icon ? <span className="text-xl">{game.icon}</span> : <Activity size={24} />}
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-full">
                    <Globe size={10} className={game.isPublished ? "text-emerald-500" : "text-slate-400"} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{game.isPublished ? 'Live' : 'Draft'}</span>
                    {loadingId === game.id && <Loader2 size={10} className="animate-spin ml-1" />}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-black">{game.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{game.description || 'No description provided.'}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Views</span>
                    <span className="text-sm font-black">{game.viewCount}</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-100 dark:border-slate-800 pl-4">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Difficulty</span>
                    <span className="text-sm font-black">{game.difficulty || 'Easy'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/user-works/${userId}/${game.slug}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all text-center uppercase tracking-widest">
                     Run
                  </Link>
                  <button onClick={() => togglePublish(game.id)} disabled={loadingId === game.id} className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 text-center">
                    {game.isPublished ? <EyeOff size={18} /> : <Globe size={18} />}
                  </button>
                  <button onClick={() => deleteGame(game.id)} disabled={loadingId === game.id} className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 text-center">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
