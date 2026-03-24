"use client"

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Sparkles, Zap, ShieldCheck, Gem } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function ShopPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 py-24 space-y-16">
      <div className="text-center space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-8">
            <ChevronLeft size={18} /> Back to Games
        </Link>
        <h1 className="text-6xl font-black tracking-tighter">Premium Store</h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Elevate your daily challenge experience with {siteConfig.name} Premium.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Themes", icon: <Sparkles className="text-amber-400" />, desc: "Unlock exclusive UI colors" },
          { title: "Unlimited", icon: <Zap className="text-indigo-500" />, desc: "Play past puzzles anytime" },
          { title: "Ad-Free", icon: <ShieldCheck className="text-emerald-500" />, desc: "Zero distractions, ever" },
        ].map(item => (
          <div key={item.title} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 bg-white dark:bg-black rounded-2xl flex items-center justify-center mx-auto shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                {item.icon}
            </div>
            <h3 className="text-xl font-black">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-[3rem] p-12 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] -mr-32 -mt-32" />
        <Gem size={48} className="mx-auto text-indigo-400" />
        <h2 className="text-3xl font-black uppercase tracking-widest">Coming Soon</h2>
        <p className="opacity-70 max-w-sm mx-auto">We are polishing the ultimate puzzle experience. Stay tuned for our launch this summer.</p>
        <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all">
            Join Waitlist
        </button>
      </div>
    </div>
  );
}
