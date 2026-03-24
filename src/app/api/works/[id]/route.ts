/**
 * Work Detail API — Update, Delete, Publish a specific work.
 * 
 * PUT    /api/works/[id] — Update work
 * DELETE /api/works/[id] — Delete work
 * PATCH  /api/works/[id] — Toggle publish status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { saveManifest, saveDefinition, saveLogic, deleteGameFiles } from '@/lib/sdk/GameFileManager';
import type { GameManifest, GameDefinition } from '@/sdk/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Update a work
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify ownership
    // @ts-ignore
    const game = await prisma.userWork.findUnique({ where: { id } });
    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const body = await req.json();
    const { manifest, definition, script } = body as {
      manifest?: GameManifest;
      definition?: GameDefinition;
      script?: string;
    };

    // Update database metadata
    if (manifest) {
      // @ts-ignore
      await prisma.userWork.update({
        where: { id },
        data: {
          title: manifest.title,
          description: manifest.description,
          icon: manifest.icon,
          color: manifest.color,
          difficulty: manifest.difficulty,
        },
      });
      await saveManifest(game.userId, game.slug, manifest);
    }

    // Update files
    if (definition) await saveDefinition(game.userId, game.slug, definition);
    if (script) await saveLogic(game.userId, game.slug, script);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

// Delete a work
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // @ts-ignore
    const game = await prisma.userWork.findUnique({ where: { id } });
    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // Delete files and database record
    await deleteGameFiles(game.userId, game.slug);
    // @ts-ignore
    await prisma.userWork.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}

// Toggle publish status
export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // @ts-ignore
    const game = await prisma.userWork.findUnique({ where: { id } });
    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // @ts-ignore
    const updated = await prisma.userWork.update({
      where: { id },
      data: { isPublished: !game.isPublished },
    });

    return NextResponse.json({ success: true, isPublished: updated.isPublished });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
