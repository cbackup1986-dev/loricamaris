"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { LayoutGrid, BarChart3, Info, User, X, Activity } from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { GlobalStatisticsModal } from './GlobalStatisticsModal';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { title: 'Home', href: '/' },
  { title: 'Archive', href: '/archive' },
  { title: 'Shop', href: '/shop' },
  { title: 'Terms', href: '/terms' },
];

export default function Header() {
  const { data: session } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/20 backdrop-blur-2xl">
        <div className="container mx-auto px-3 md:px-6 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group transition-transform hover:scale-[1.02]">
              <div className="p-1.5 md:p-2.5 brand-gradient rounded-xl md:rounded-2xl shadow-xl shadow-indigo-500/20 group-hover:rotate-6 transition-all">
                <LayoutGrid className="text-white" size={18} />
              </div>
              <span className="font-black text-lg md:text-2xl tracking-tighter text-white uppercase italic">
                Lorica<span className="text-indigo-400">Maris</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-indigo-400 transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-0.5 md:gap-1 bg-black/20 p-0.5 md:p-1 rounded-xl md:rounded-2xl border border-white/5">
              <button 
                onClick={() => setIsStatsOpen(true)}
                className="p-1.5 md:p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg md:rounded-xl transition-all"
                title="Global Intelligence"
              >
                <BarChart3 size={16} className="md:w-5 md:h-5" />
              </button>
              <button 
                className="p-1.5 md:p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg md:rounded-xl transition-all"
                title="System Briefing"
              >
                <Info size={16} className="md:w-5 md:h-5" />
              </button>
            </div>

            <div className="hidden md:block h-8 w-[1px] bg-white/5 mx-2" />

            {session ? (
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-1.5 md:gap-3 pl-1 pr-2 md:pr-4 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full border border-indigo-500/20 transition-all group"
                title="Click to Sign Out"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full brand-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-all text-[10px] font-black">
                  {session.user?.username?.[0] || 'U'}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none mr-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{session.user?.username}</span>
                  <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Operative Active</span>
                </div>
                <Link 
                  href="/create"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Activity size={12} className="text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">Studio</span>
                </Link>

              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-3 md:px-6 py-2 md:py-2.5 brand-gradient text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.05] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modals rendered OUTSIDE header to avoid backdrop-filter containing block */}
      <GlobalStatisticsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
        session={session}
      />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </>
  );
}
