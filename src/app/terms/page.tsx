import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto px-6 py-24 prose dark:prose-invert">
      <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold no-underline mb-12 hover:underline">
          <ChevronLeft size={18} /> Home
      </Link>
      <h1 className="text-5xl font-black tracking-tight mb-12">Terms of Service</h1>
      <p className="text-lg opacity-80">Last Updated: March 2026</p>
      
      <section className="space-y-6 mt-16">
        <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
        <p>Elevate your daily challenge experience with {siteConfig.name} Premium. By accessing and using {siteConfig.name}, you agree to bound by these terms. If you do not agree, please do not use our services.</p>
        
        <h2 className="text-2xl font-bold">2. Use of Service</h2>
        <p>{siteConfig.name} is intended for personal, non-commercial use. You may not use automated scripts to solve puzzles or crawl our data.</p>
        
        <h2 className="text-2xl font-bold">3. Premium Accounts</h2>
        <p>Subscriptions are billed on a recurring basis. You may cancel at any time, but no refunds will be provided for partial months.</p>
      </section>
      
      <div className="mt-24 p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 not-prose">
          <p className="text-sm text-center text-muted-foreground font-medium uppercase tracking-[0.2em]">{siteConfig.name} Legal Division</p>
      </div>
    </div>
  );
}
