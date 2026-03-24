import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { saveManifest, saveDefinition, saveLogic, deleteGameFiles } from "@/lib/sdk/GameFileManager";
import { GameManifest, GameDefinition } from "@/sdk/types";
import { getOrCreateGuestUser } from "@/lib/sdk/idUtils";

/**
 * Helper to generate slug from title
 */
function slugify(text: string) {
  const s = text
    .toString()
    .toLowerCase()
    .normalize('NFD') // handle accents
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
  return s || "game";
}

/**
 * Automated Publish & Management API for OpenClaw.
 * 
 * Header: Authorization: Bearer PEAK_...
 */

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    let user;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Verify token
      user = await prisma.user.findUnique({
        // @ts-ignore
        where: { developerToken: token },
        select: { id: true, username: true }
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid developer token" }, { status: 403 });
      }
    } else {
      // Guest Mode: Self-healing lookup
      user = await getOrCreateGuestUser();
    }

    const bodyText = await req.text();
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e: any) {
      return NextResponse.json({
        error: "Invalid JSON body",
        details: e.message,
        hint: "Check for unescaped newlines or special characters in your 'script' or 'definition' strings. Multi-line strings must use \\n."
      }, { status: 400 });
    }

    const { manifest, definition, script } = body;
    let { slug } = body;

    const missingFields = [];
    if (!manifest) missingFields.push("manifest");
    if (!definition) missingFields.push("definition");
    if (!script) missingFields.push("script");

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
        received: Object.keys(body)
      }, { status: 400 });
    }

    // Auto-generate slug if missing
    if (!slug) {
      const baseSlug = slugify(manifest.title || "game");
      // Check for collision for this user
      const existing = await prisma.userWork.findUnique({
        where: { userId_slug: { userId: user.id, slug: baseSlug } }
      });
      
      if (existing) {
        // If it exists, we can either overwrite (by using the same slug) 
        // or create a new one (by adding suffix). 
        // For OpenClaw/automated tools, overwriting is usually preferred if they use the same title.
        slug = baseSlug;
      } else {
        slug = baseSlug;
      }
    }

    // 1. Update/Create Game record in DB
    // @ts-ignore
    const game = await prisma.userWork.upsert({
      where: { userId_slug: { userId: user.id, slug } },
      create: {
        userId: user.id,
        slug,
        title: manifest.title,
        description: manifest.description || "",
        icon: manifest.icon || "Sparkles",
        color: manifest.color || "bg-pink-500",
        difficulty: manifest.difficulty || "Medium",
        isPublished: true,
      },
      update: {
        title: manifest.title,
        description: manifest.description || "",
        icon: manifest.icon || "Sparkles",
        color: manifest.color || "bg-pink-500",
        difficulty: manifest.difficulty || "Medium",
        isPublished: true,
      }
    });

    // 2. Write files to disk
    await saveManifest(user.id, slug, manifest as GameManifest);
    await saveDefinition(user.id, slug, definition as GameDefinition);
    await saveLogic(user.id, slug, script);

    // 3. Update token usage
    await prisma.user.update({
      where: { id: user.id },
      // @ts-ignore
      data: { tokenLastUsed: new Date() }
    });

    const host = req.headers.get("host") || process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const url = `${protocol}://${host}/user-works/${user.id}/${slug}`;

    return NextResponse.json({
      success: true,
      message: `Game published successfully!`,
      data: {
        slug,
        title: manifest.title,
        url,
        gameId: game.id
      }
    });

  } catch (error: any) {
    console.error("[Publish API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const token = authHeader.substring(7);

    // Verify token
    const user = await prisma.user.findUnique({
      // @ts-ignore
      where: { developerToken: token },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // Delete from DB (Verify ownership implicitly via userId_slug)
    // @ts-ignore
    await prisma.userWork.delete({
      where: { userId_slug: { userId: user.id, slug } }
    });

    // Delete files
    await deleteGameFiles(user.id, slug);

    return NextResponse.json({
      success: true,
      message: `Game '${slug}' deleted successfully.`
    });

  } catch (error: any) {
    console.error("[Publish API DELETE Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
