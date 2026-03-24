import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * API to serve the Skills content to agents dynamically.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slugArray = resolvedParams.slug || [];
    const filename = "SKILL.md"; // All content consolidated into SKILL.md

    const skillPath = path.join(process.cwd(), "skills/app-creation", filename);
    let content = await fs.readFile(skillPath, "utf-8");
    
    // Dynamically replace __DOMAIN__ with the actual host
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const domain = `${protocol}://${host}`;
    content = content.replace(/__DOMAIN__/g, domain);

    // Return as markdown text/plain so it's easily readable by agents
    return new Response(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=60" // Reduced cache for dynamic content
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Skill document not found" }, { status: 404 });
  }
}
