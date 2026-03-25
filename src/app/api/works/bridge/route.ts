import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Data/API Bridge — Secure proxy for sandboxed applications.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, workId, payload } = body;

    if (!workId) return NextResponse.json({ error: "Missing workId" }, { status: 400 });

    // Validate work exists and is published
    const work = await prisma.userWork.findUnique({
      where: { id: workId },
      select: { isPublished: true, userId: true },
    });

    if (!work) return NextResponse.json({ error: "Work not found" }, { status: 404 });

    // ── 1. External Fetch Proxy ───────────────────────────────
    if (type === "fetch") {
      const { url, options } = payload;
      
      // Simple Whitelist Check (Example implementation)
      const allowedDomains = ["api.github.com", "openlibrary.org", "api.coindesk.com"];
      const isAllowed = allowedDomains.some(d => url.includes(d));
      
      if (!isAllowed) {
        return NextResponse.json({ 
          error: "Domain not whitelisted", 
          hint: `Contact platform owner to whitelist: ${url}` 
        }, { status: 403 });
      }

      const response = await fetch(url, {
        method: options?.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    }

    // ── 2. Managed Database (DB) Proxy ────────────────────────
    if (type === "db") {
      const { action, key, value } = payload;

      if (action === "getRow") {
        const record = await prisma.workData.findFirst({
          where: { userWorkId: workId, key },
        });
        return NextResponse.json({ success: true, data: record ? JSON.parse(record.value) : null });
      }

      if (action === "addRow" || action === "updateRow") {
        const upserted = await prisma.workData.upsert({
          where: { 
            // Composite index would be better, but for now we find by userWorkId + key
            id: (await prisma.workData.findFirst({ where: { userWorkId: workId, key }, select: { id: true } }))?.id || "temp-id"
          },
          update: { value: JSON.stringify(value) },
          create: { userWorkId: workId, key, value: JSON.stringify(value) },
        });
        return NextResponse.json({ success: true, data: upserted });
      }

      if (action === "deleteRow") {
        await prisma.workData.deleteMany({
          where: { userWorkId: workId, key },
        });
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Invalid bridge type" }, { status: 400 });

  } catch (error: any) {
    console.error("[Bridge API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
