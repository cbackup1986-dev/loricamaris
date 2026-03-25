import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import AdmZip from "adm-zip";
import { saveManifest, saveDefinition, saveLogic } from "@/lib/sdk/GameFileManager";
import { GameManifest, GameDefinition } from "@/sdk/types";

/**
 * Fixed slugify — does NOT call .normalize('NFD') before the Unicode regex.
 * NFD decomposition breaks CJK characters on some Node.js versions/platforms.
 */
function slugify(text: string): string {
  let s = text.toString().trim();
  s = s.replace(/\s+/g, "-");
  s = s.replace(/[^\p{L}\p{N}-]+/gu, "");
  s = s.replace(/-{2,}/g, "-").toLowerCase();
  if (!s || s.length < 1) {
    return `app-${Math.random().toString(36).substring(2, 8)}`;
  }
  return s;
}

export async function POST(req: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    let user: { id: string; username: string };

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const found = await prisma.user.findUnique({
        // @ts-ignore
        where: { developerToken: token },
        select: { id: true, username: true },
      });
      if (!found) {
        return NextResponse.json(
          { error: "Invalid developer token" },
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

    // ── Parse multipart ───────────────────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    let slug = (formData.get("slug") as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Expected multipart field named 'file'." },
        { status: 400 }
      );
    }

    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum is 100 MB.` },
        { status: 413 }
      );
    }

    // ── Parse ZIP ─────────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    let zip: AdmZip;
    try {
      zip = new AdmZip(buffer);
      zip.getEntries(); // force parse
    } catch (e: any) {
      return NextResponse.json(
        { error: "Failed to parse ZIP file.", details: e.message },
        { status: 400 }
      );
    }

    let manifestData: GameManifest | null = null;
    let definitionData: GameDefinition | null = null;
    let scriptContent: string | null = null;

    for (const entry of zip.getEntries()) {
      const entryName = entry.entryName;

      // Security: prevent path traversal
      if (entryName.includes("..") || entryName.startsWith("/") || entryName.startsWith("\\")) {
        return NextResponse.json(
          { error: `Security warning: malicious path detected: ${entryName}` },
          { status: 403 }
        );
      }

      const fileName = entryName.split("/").pop()?.toLowerCase();
      if (!fileName) continue;

      // Read as UTF-8, stripping BOM if present
      const rawBytes = entry.getData();
      let text = rawBytes.toString("utf8");
      if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM

      if (fileName === "manifest.json") {
        try { manifestData = JSON.parse(text); } catch {
          return NextResponse.json({ error: "Failed to parse manifest.json in ZIP" }, { status: 400 });
        }
      } else if (fileName === "definition.json") {
        try { definitionData = JSON.parse(text); } catch {
          return NextResponse.json({ error: "Failed to parse definition.json in ZIP" }, { status: 400 });
        }
      } else if (fileName === "logic.js" || fileName === "script.js") {
        scriptContent = text;
      }
    }

    const missing: string[] = [];
    if (!manifestData) missing.push("manifest.json");
    if (!definitionData) missing.push("definition.json");
    if (!scriptContent) missing.push("logic.js");
    if (missing.length > 0) {
      return NextResponse.json({ error: "Required files missing in ZIP", missing }, { status: 400 });
    }
    if (!manifestData!.title) {
      return NextResponse.json({ error: "manifest.json is missing 'title'" }, { status: 400 });
    }

    // ── Resolve slug ──────────────────────────────────────────────────────────
    if (!slug) {
      slug = slugify(manifestData!.title);
    } else {
      slug = slug.replace(/[^\p{L}\p{N}-]+/gu, "").toLowerCase() || slugify(manifestData!.title);
    }

    // ── Upsert DB ─────────────────────────────────────────────────────────────
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
      },
    });

    // ── Write files ───────────────────────────────────────────────────────────
    await saveManifest(user.id, slug, manifestData!);
    await saveDefinition(user.id, slug, definitionData!);
    await saveLogic(user.id, slug, scriptContent!);

    await prisma.user.update({
      where: { id: user.id },
      // @ts-ignore
      data: { tokenLastUsed: new Date() },
    });

    const host =
      req.headers.get("host") ||
      process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ||
      "localhost:3000";
    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const url = `${protocol}://${host}/user-works/${user.id}/${slug}`;

    return NextResponse.json({
      success: true,
      message: "App published via ZIP!",
      data: { slug, title: manifestData!.title, url, gameId: game.id },
    });
  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
