import type { Metadata } from "next";
import Link from 'next/link';
import { AdSlot } from "@/components/common/AdSlot";
import Header from "@/components/layout/Header";
import Analytics from "@/components/common/Analytics";
import VersionSyncHandler from "@/components/common/VersionSyncHandler";
import { siteConfig } from "@/config/site";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Intelligence & Logic Platform`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <VersionSyncHandler />
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          <Header />
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="hidden md:block border-t border-slate-200 dark:border-slate-800 py-6 px-6 print:hidden">
            <div className="container max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{siteConfig.name}</span>
                <span>© 2026. Premium Challenges.</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
