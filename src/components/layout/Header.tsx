"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { LayoutGrid, BarChart3, Info, User, X, Activity, LogOut, ChevronDown, Settings } from 'lucide-react';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 md:gap-3 pl-1 pr-2 md:pr-4 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-full border border-indigo-500/20 transition-all group lg:min-w-[160px]"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full brand-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-all text-[10px] font-black">
                    {session.user?.username?.[0] || 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{session.user?.username}</span>
                    <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Operative Active</span>
                  </div>
                  <ChevronDown className={cn("text-white/40 group-hover:text-white transition-transform duration-300", isUserMenuOpen && "rotate-180")} size={14} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 origin-top-right z-50 overflow-hidden bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
                      <div className="p-3 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white font-black text-sm">
                            {session.user?.username?.[0] || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white uppercase tracking-wider">{session.user?.username}</span>
                            <span className="text-[9px] font-medium text-white/40 truncate">{session.user?.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <Link 
                          href="/create"
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white/70 hover:text-white hover:bg-indigo-500/20 rounded-xl transition-all group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Activity size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span>Simulation Studio</span>
                        </Link>
                        
                        <button 
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-white/70 hover:text-white hover:bg-indigo-500/20 rounded-xl transition-all group"
                        >
                          <Settings size={16} className="text-indigo-400 group-hover:rotate-45 transition-transform" />
                          <span>System Config</span>
                        </button>
                      </div>

                      <div className="p-2 border-t border-white/5 bg-red-500/5">
                        <button 
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
                        >
                          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                          <span>Abort Session</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
