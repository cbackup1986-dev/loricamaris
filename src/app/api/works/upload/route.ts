import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import { saveManifest, saveDefinition, saveLogic } from "@/lib/sdk/GameFileManager";
import { GameManifest, GameDefinition } from "@/sdk/types";
import { getOrCreateGuestUser } from "@/lib/sdk/idUtils";

/**
 * Helper to generate slug from title
 */
function slugify(text: string) {
  let s = text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .trim()
    .replace(/\s+/g, '-')
    // Use Unicode property escapes to allow letters and numbers from any language
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/--+/g, '-');
  
  // If empty or too short, fallback to a prefixed random string
  if (!s || s.length < 2) {
    const random = Math.random().toString(36).substring(2, 8);
    return `game-${random}`;
  }
  return s;
}

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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let slug = formData.get("slug") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded. Expected 'file' field." }, { status: 400 });
    }

    // 100MB Size Limit
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 100MB.` 
      }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let zip;
    try {
      zip = new AdmZip(buffer);
      // Force read entries to trigger any parsing errors early
      zip.getEntries();
    } catch (e: any) {
      console.error("[Zip Parse Error]:", e);
      return NextResponse.json({ 
        error: "Failed to parse ZIP file. Is it a valid archive?", 
        details: e.message 
      }, { status: 400 });
    }

    const zipEntries = zip.getEntries();
    let manifestData: GameManifest | null = null;
    let definitionData: GameDefinition | null = null;
    let scriptContent: string | null = null;

    // Security & Extraction Loop
    for (const entry of zipEntries) {
      const entryName = entry.entryName;

      // 1. Zip Slip Protection (Path Traversal)
      if (entryName.includes("..") || entryName.startsWith("/") || entryName.startsWith("\\")) {
        return NextResponse.json({ error: `Security Warning: Malicious path detected in ZIP: ${entryName}` }, { status: 403 });
      }

      // 2. Strict File Filtering (Allow-list)
      const fileName = entryName.split('/').pop()?.toLowerCase();
      if (!fileName) continue;

      if (fileName === "manifest.json") {
        try {
          manifestData = JSON.parse(entry.getData().toString("utf8"));
        } catch (e) {
          return NextResponse.json({ error: "Failed to parse manifest.json inside ZIP" }, { status: 400 });
        }
      } else if (fileName === "definition.json") {
        try {
          definitionData = JSON.parse(entry.getData().toString("utf8"));
        } catch (e) {
          return NextResponse.json({ error: "Failed to parse definition.json inside ZIP" }, { status: 400 });
        }
      } else if (fileName === "logic.js" || fileName === "script.js") {
        scriptContent = entry.getData().toString("utf8");
      }
    }

    // 3. Mandatory Field Validation
    const missing = [];
    if (!manifestData) missing.push("manifest.json");
    if (!definitionData) missing.push("definition.json");
    if (!scriptContent) missing.push("logic.js (or script.js)");

    if (missing.length > 0) {
      return NextResponse.json({ 
        error: "Required files missing in ZIP archive", 
        missing,
        hint: "Ensure your ZIP contains manifest.json, definition.json, and logic.js at the root or within allowed paths." 
      }, { status: 400 });
    }

    if (!manifestData!.title) {
        return NextResponse.json({ error: "manifest.json is missing 'title' field" }, { status: 400 });
    }

    // Auto-generate slug if missing
    if (!slug) {
      const baseSlug = slugify(manifestData!.title || "game");
      // Check for collision for this user
      const existing = await prisma.userWork.findUnique({
        where: { userId_slug: { userId: user.id, slug: baseSlug } }
      });
      
      if (existing) {
        // Overwrite if same title/slug for same user
        slug = baseSlug;
      } else {
        slug = baseSlug;
      }
    }

    // 4. Update/Create Game record in DB
    // @ts-ignore
    const game = await prisma.userWork.upsert({
      where: { userId_slug: { userId: user.id, slug } },
      create: {
        userId: user.id,
        slug,
        title: manifestData!.title,
        description: manifestData!.description || "",
        icon: manifestData!.icon || "Sparkles",
        color: manifestData!.color || "bg-pink-500",
        difficulty: manifestData!.difficulty || "Medium",
        isPublished: true,
      },
      update: {
        title: manifestData!.title,
        description: manifestData!.description || "",
        icon: manifestData!.icon || "Sparkles",
        color: manifestData!.color || "bg-pink-500",
        difficulty: manifestData!.difficulty || "Medium",
        isPublished: true,
      }
    });

    // 5. Write files to disk
    await saveManifest(user.id, slug, manifestData!);
    await saveDefinition(user.id, slug, definitionData!);
    await saveLogic(user.id, slug, scriptContent!);

    // 6. Update token usage
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
      message: `Game published successfully via ZIP upload!`,
      data: {
        slug,
        title: manifestData!.title,
        url,
        gameId: game.id
      }
    });

  } catch (error: any) {
    console.error("[Zip Upload API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
