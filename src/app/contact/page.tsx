"use client"

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, Twitter } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function ContactPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 py-24 border-x border-slate-100 dark:border-slate-900 min-h-screen">
      <div className="space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            <ChevronLeft size={18} /> Back Home
        </Link>
        
        <div className="space-y-6">
            <h1 className="text-7xl font-black tracking-tighter">Get in Touch.</h1>
            <p className="text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                Whether you found a bug, have a feature idea, or just want to say hello, we're all ears.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
            <section className="space-y-8">
                <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Support</h3>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                            <Mail size={24} />
                        </div>
                        <span className="text-xl font-bold">{siteConfig.links.support}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Collaborate</h3>
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Twitter size={24} />
                        </div>
                        <span className="text-xl font-bold">@LoricaMaris_Hub</span>
                    </div>
                </div>
            </section>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="text" 
                    placeholder="Subject" 
                    className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] font-bold focus:ring-4 focus:ring-primary/20 transition-all"
                />
                <textarea 
                    placeholder="Your Message" 
                    rows={6}
                    className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[1.5rem] font-bold focus:ring-4 focus:ring-primary/20 transition-all resize-none"
                />
                <button className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-lg rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                    Send Message
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
