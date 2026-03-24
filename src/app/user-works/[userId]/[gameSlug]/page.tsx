/**
 * Dynamic User Game Page (Server Component)
 * 
 * Route: /user-works/[userId]/[gameSlug]
 * 
 * Loads the game metadata from DB and files from disk,
 * then passes them to the client-side GameRenderer.
 */

import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { readDefinition, readLogic } from '@/lib/sdk/GameFileManager';
import UserGameClient from './UserGameClient';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';


interface PageProps {
  params: Promise<{ userId: string; gameSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId, gameSlug } = await params;
  const game = await prisma.userWork.findFirst({
    where: { slug: gameSlug, userId },
    include: { user: { select: { username: true } } },
  });

  if (!game) return { title: 'Game Not Found' };

  return {
    title: `${game.title} by ${game.user.username} | ${siteConfig.name}`,
    description: game.description || `Play ${game.title} on ${siteConfig.name}`,
  };
}

export default async function UserGamePage({ params }: PageProps) {
  const { userId, gameSlug } = await params;

  // Load metadata from DB
  const game = await prisma.userWork.findFirst({
    where: { slug: gameSlug, userId },
    include: { user: { select: { id: true, username: true } } },
  });

  if (!game) {
    console.warn(`[UserGamePage] Game not found in DB: userId=${userId}, slug=${gameSlug}`);
    notFound();
  }

  console.log(`[UserGamePage] Found game in DB. Attempting to load files for userId=${game.userId}, slug=${gameSlug}`);

  // Load files from disk
  const definition = await readDefinition(game.userId, gameSlug);
  const script = await readLogic(game.userId, gameSlug);

  if (!definition || !script) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <h2 className="text-2xl font-black">Game files not found</h2>
        <p className="text-muted-foreground text-sm">
          The game definition or logic files are missing for this game.
        </p>
      </div>
    );
  }

  // Increment play count
  await prisma.userWork.update({
    where: { id: game.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <UserGameClient
      game={{
        id: game.id,
        title: game.title,
        description: game.description,
        icon: game.icon,
        color: game.color,
        difficulty: game.difficulty,
        username: game.user.username,
        viewCount: game.viewCount,
      }}
      definition={definition}
      script={script}
    />
  );
}
