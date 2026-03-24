/**
 * User Creation Center (Server Component)
 * 
 * Route: /create
 * 
 * Lists games created by the current logged-in user.
 * Redirects to sign-in if not authenticated.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import CreationClient from './CreationClient';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';


export const metadata: Metadata = {
  title: `Creator Studio | ${siteConfig.name}`,
  description: 'Manage your custom logic games and puzzles.',
};

export default async function CreationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/create');
  }

  const userId = session.user.id;
  const username = (session.user as any).username || "unknown";

  // Fetch games from database
  // @ts-ignore - prisma.userGame is generated but sometimes not picked up by TS server immediately
  const games = await prisma.userWork.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white">Creator Studio</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
          Manage, publish, and track your custom logic games.
        </p>
      </div>

      <CreationClient initialGames={games.map((g: any) => ({
        id: g.id,
        slug: g.slug,
        title: g.title,
        description: g.description,
        icon: g.icon,
        color: g.color,
        difficulty: g.difficulty,
        isPublished: g.isPublished,
        viewCount: g.viewCount,
        createdAt: g.createdAt.toISOString(),
      }))} userId={userId} username={username} />
    </div>
  );
}
