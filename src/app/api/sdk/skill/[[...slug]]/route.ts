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
    let filename = "SKILL.md"; // default

    if (slugArray.length > 0) {
      const section = slugArray[0];
      if (section === "components") filename = "skill-components.md";
      else if (section === "templates") filename = "skill-templates.md";
      else if (section === "publish") filename = "skill-publish.md";
      else filename = "SKILL.md";
    }

    const skillPath = path.join(process.cwd(), "skills/game-creation", filename);
    const content = await fs.readFile(skillPath, "utf-8");
    
    // Return as markdown text/plain so it's easily readable by agents
    return new Response(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Skill document not found" }, { status: 404 });
  }
}
