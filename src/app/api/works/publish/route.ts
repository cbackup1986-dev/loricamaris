import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { saveManifest, saveDefinition, saveLogic, deleteGameFiles } from "@/lib/sdk/GameFileManager";
import { GameManifest, GameDefinition } from "@/sdk/types";

/**
 * Converts a title into a URL-safe slug.
 * Handles Chinese, Japanese, Korean, and other Unicode scripts correctly.
 * 
 * Key fix: do NOT call .normalize('NFD') before the Unicode regex,
 * because NFD decomposes CJK characters into base+combining forms
 * that then get stripped by the \p{L}\p{N} filter on some runtimes.
 */
function slugify(text: string): string {
  // Step 1: trim whitespace
  let s = text.toString().trim();

  // Step 2: replace whitespace runs with hyphens
  s = s.replace(/\s+/g, '-');

  // Step 3: remove characters that are not Unicode letters, digits, or hyphens
  // NOTE: do NOT normalize to NFD first — that breaks CJK characters
  s = s.replace(/[^\p{L}\p{N}-]+/gu, '');

  // Step 4: collapse multiple hyphens
  s = s.replace(/-{2,}/g, '-');

  // Step 5: lowercase (safe for ASCII; CJK is unaffected)
  s = s.toLowerCase();

  // Fallback if result is empty or too short
  if (!s || s.length < 1) {
    const random = Math.random().toString(36).substring(2, 8);
    return `app-${random}`;
  }

  return s;
}

/**
 * Automated Publish & Management API.
 *
 * POST /api/works/publish
 *
 * Headers:
 *   Content-Type: application/json; charset=utf-8
 *   Authorization: Bearer PEAK_...   (optional — guest mode if absent)
 *
 * Body (application/json):
 *   manifest   object   App metadata
 *   definition object   UI layout JSON
 *   script     string   Logic JS code (must be a valid JSON string — newlines as \n)
 *   slug       string   (optional) custom URL slug
 */
export async function POST(req: Request) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    let user: { id: string; username: string };

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const found = await prisma.user.findUnique({
        // @ts-ignore — developerToken added via schema
        where: { developerToken: token },
        select: { id: true, username: true },
      });
      if (!found) {
        return NextResponse.json(
          { error: "Invalid developer token", hint: "Get your token from /create → Enable Developer Access" },
          { status: 403 }
        );
      }
      user = found;
    } else {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a Bearer token." },
        { status: 401 }
      );
    }

    // ── 2. Parse body (with detailed error for encoding issues) ───────────────
    const rawBody = await req.arrayBuffer();

    // Detect and handle BOM (Windows editors sometimes add UTF-8 BOM: EF BB BF)
    let bodyText: string;
    const bytes = new Uint8Array(rawBody);
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      // Strip UTF-8 BOM
      bodyText = new TextDecoder("utf-8").decode(bytes.slice(3));
    } else {
      bodyText = new TextDecoder("utf-8").decode(bytes);
    }

    let body: {
      manifest?: GameManifest;
      definition?: GameDefinition;
      script?: string;
      slug?: string;
    };

    try {
      body = JSON.parse(bodyText);
    } catch (e: any) {
      return NextResponse.json(
        {
          error: "Invalid JSON body — failed to parse request",
          details: e.message,
          hint: [
            "1. The 'script' field must be a JSON string — newlines must be \\n, not literal line breaks.",
            "2. Always use json.dumps() (Python) or JSON.stringify() (JS) to build the payload.",
            "3. On Windows, save files as UTF-8 (not GBK/GB2312) before posting.",
            "4. The Content-Type header must be: application/json; charset=utf-8",
          ].join(" | "),
        },
        { status: 400 }
      );
    }

    // ── 3. Validate required fields ──────────────────────────────────────────
    const { manifest, definition, script } = body;
    let { slug } = body;

    // We still need manifest.title if it's a new work, or slug if it's an update.
    // Logic: If manifest is provided, title is required.
    if (manifest && !manifest.title) {
      return NextResponse.json({ error: "manifest.title is required when manifest is provided" }, { status: 400 });
    }

    if (script !== undefined && typeof script !== "string") {
      return NextResponse.json(
        {
          error: "The 'script' field must be a string, not an object or array",
          hint: "Pass your JS code as a string value, e.g. \"script\": \"api.registerHandler(...)\"",
        },
        { status: 400 }
      );
    }

    // ── 4. Resolve slug ──────────────────────────────────────────────────────
    if (!slug) {
      if (manifest?.title) {
        slug = slugify(manifest.title);
      } else {
        return NextResponse.json({ error: "Slug or manifest.title is required to identify the work" }, { status: 400 });
      }
    } else {
      // Sanitize caller-provided slug (allow Unicode letters + digits + hyphens)
      slug = slug.replace(/[^\p{L}\p{N}-]+/gu, "").toLowerCase();
      if (!slug && manifest?.title) slug = slugify(manifest.title);
    }

    // ── 5. Upsert database record ────────────────────────────────────────────
    const updateData: any = { isPublished: true };
    if (manifest?.title) updateData.title = manifest.title;
    if (manifest?.description) updateData.description = manifest.description;
    if (manifest?.icon) updateData.icon = manifest.icon;
    if (manifest?.color) updateData.color = manifest.color;
    if (manifest?.difficulty) updateData.difficulty = manifest.difficulty;

    // @ts-ignore
    const game = await prisma.userWork.upsert({
      where: { userId_slug: { userId: user.id, slug } },
      create: {
        userId: user.id,
        slug,
        title: manifest?.title || "Untitled",
        description: manifest?.description || "",
        icon: manifest?.icon || "Sparkles",
        color: manifest?.color || "bg-pink-500",
        difficulty: manifest?.difficulty || "Medium",
        isPublished: true,
      },
      update: updateData,
    });

    // ── 6. Write files to disk ───────────────────────────────────────────────
    if (manifest) await saveManifest(user.id, slug, manifest);
    if (definition) await saveDefinition(user.id, slug, definition);
    if (script) await saveLogic(user.id, slug, script);

    // ── 7. Update token last-used timestamp ──────────────────────────────────
    await prisma.user.update({
      where: { id: user.id },
      // @ts-ignore
      data: { tokenLastUsed: new Date() },
    });

    // ── 8. Return success ────────────────────────────────────────────────────
    const host =
      req.headers.get("host") ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ||
      "localhost:3000";
    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const url = `${protocol}://${host}/user-works/${user.id}/${slug}`;

    return NextResponse.json({
      success: true,
      message: "Game published successfully!",
      data: { slug, title: manifest!.title, url, gameId: game.id },
    });
  } catch (error: any) {
    console.error("[Publish API Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const token = authHeader.substring(7);
    const user = await prisma.user.findUnique({
      // @ts-ignore
      where: { developerToken: token },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // @ts-ignore
    await prisma.userWork.delete({
      where: { userId_slug: { userId: user.id, slug } },
    });
    await deleteGameFiles(user.id, slug);

    return NextResponse.json({ success: true, message: `Game '${slug}' deleted successfully.` });
  } catch (error: any) {
    console.error("[Publish DELETE Error]:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
