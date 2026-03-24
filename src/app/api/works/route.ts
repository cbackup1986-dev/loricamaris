/**
 * Works API — CRUD endpoints for user-created applications/works.
 * 
 * POST /api/works — Create a new work
 * GET  /api/works — List works (by userId or all published)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { saveManifest, saveDefinition, saveLogic } from '@/lib/sdk/GameFileManager';
import type { GameManifest, GameDefinition } from '@/sdk/types';

// Create a new work
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { slug, manifest, definition, script } = body as {
      slug: string;
      manifest: GameManifest;
      definition: GameDefinition;
      script: string;
    };

    if (!slug || !manifest || !definition || !script) {
      return NextResponse.json({ error: 'Missing required fields: slug, manifest, definition, script' }, { status: 400 });
    }

    // Validate slug format (Allow Unicode letters and numbers)
    if (!/^[\p{L}\p{N}-]+$/u.test(slug)) {
      return NextResponse.json({ error: 'Slug must be alphanumeric (Unicode supported) with hyphens' }, { status: 400 });
    }

    const userId = session.user.id;

    // Save metadata to database
    // @ts-ignore
    const game = await prisma.userWork.upsert({
      where: { userId_slug: { userId, slug } },
      update: {
        title: manifest.title,
        description: manifest.description,
        icon: manifest.icon,
        color: manifest.color,
        difficulty: manifest.difficulty,
        updatedAt: new Date(),
      },
      create: {
        userId,
        slug,
        title: manifest.title,
        description: manifest.description,
        icon: manifest.icon,
        color: manifest.color,
        difficulty: manifest.difficulty,
      },
    });

    // Save files to disk
    await saveManifest(userId, slug, manifest);
    await saveDefinition(userId, slug, definition);
    await saveLogic(userId, slug, script);

    return NextResponse.json({ 
      success: true, 
      work: {
        id: game.id,
        slug: game.slug,
        url: `/user-works/${(session.user as any).username}/${slug}`,
      }
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    // Handle unique constraint violation
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'A work with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// List works
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const published = searchParams.get('published');

  try {
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (published === 'true') where.isPublished = true;

    // @ts-ignore
    const games = await prisma.userWork.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ works: games });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
