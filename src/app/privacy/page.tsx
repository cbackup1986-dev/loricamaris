import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-6 py-24 prose dark:prose-invert">
      <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold no-underline mb-12 hover:underline">
          <ChevronLeft size={18} /> Home
      </Link>
      <h1 className="text-5xl font-black tracking-tight mb-12">Privacy Policy</h1>
      <p className="text-lg opacity-80">Last Updated: March 2026</p>
      
      <section className="space-y-6 mt-16">
        <h2 className="text-2xl font-bold">Data We Collect</h2>
        <p>We collect minimal data necessary to provide our service: browser type, language preference, and game statistics (stored locally or synced via account).</p>
        
        <h2 className="text-2xl font-bold">How We Use Data</h2>
        <p>We use your data to track streaks, provide global rankings, and optimize our puzzles for all users.</p>
        
        <h2 className="text-2xl font-bold">Your Rights</h2>
        <p>You have the right to export or delete your data at any time through our settings panel.</p>
      </section>

       <div className="mt-24 p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 not-prose">
          <p className="text-sm text-center text-muted-foreground font-medium uppercase tracking-[0.2em]">{siteConfig.name} Privacy Guard</p>
      </div>
    </div>
  );
}
