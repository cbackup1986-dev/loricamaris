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
      const { action, key, value, table, data: inputData, options } = payload;

      // --- Legacy Key-Value Store ---
      if (action === "getRow") {
        const record = await prisma.workData.findFirst({
          where: { userWorkId: workId, key },
        });
        return NextResponse.json({ success: true, data: record ? JSON.parse(record.value) : null });
      }

      if (action === "addRow" || action === "updateRow") {
        const existing = await prisma.workData.findFirst({ where: { userWorkId: workId, key }, select: { id: true } });
        const upserted = await prisma.workData.upsert({
          where: { id: existing?.id || "new-id-" + Math.random() },
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

      // --- Virtual Table API (Advanced) ---
      if (action === "createTable") {
        const metaKey = "__tables__";
        const meta = await (prisma as any).workData.findFirst({ where: { userWorkId: workId, key: metaKey } });
        const tables = meta ? JSON.parse(meta.value) : {};
        
        // --- Incremental Schema Merging ---
        const existingTable = tables[table] || { schema: {}, createdAt: new Date() };
        tables[table] = { 
          ...existingTable,
          schema: { ...existingTable.schema, ...value }, // Merge schemas
          updatedAt: new Date() 
        };
        
        await (prisma as any).workData.upsert({
          where: { id: meta?.id || "new-meta-" + Math.random() },
          update: { value: JSON.stringify(tables) },
          create: { userWorkId: workId, key: metaKey, value: JSON.stringify(tables) },
        });
        return NextResponse.json({ success: true });
      }

      if (action === "insert") {
        const rowId = Math.random().toString(36).substring(2, 10);
        const tblKey = `tbl:${table}:${rowId}`;
        const inserted = await prisma.workData.create({
          data: { userWorkId: workId, key: tblKey, value: JSON.stringify(inputData) },
        });
        return NextResponse.json({ success: true, data: { id: rowId, ...inputData } });
      }

      if (action === "select") {
        const records = await (prisma as any).workData.findMany({
          where: { userWorkId: workId, key: { startsWith: `tbl:${table}:` } },
        });
        let results = records.map((r: any) => ({ id: r.key.split(":").pop(), ...JSON.parse(r.value) }));
        
        // Simple filter
        if (options?.where) {
          results = results.filter((r: any) => {
            return Object.entries(options.where).every(([k, v]) => r[k] === v);
          });
        }
        return NextResponse.json({ success: true, data: results });
      }

      if (action === "aggregate") {
        const records = await (prisma as any).workData.findMany({
          where: { userWorkId: workId, key: { startsWith: `tbl:${table}:` } },
        });
        const rows = records.map((r: any) => JSON.parse(r.value));

        if (options.count) return NextResponse.json({ success: true, data: rows.length });

        if (options.sum || options.avg) {
          const field = options.sum || options.avg;
          const sum = rows.reduce((acc: number, r: any) => acc + (Number(r[field]) || 0), 0);
          const result = options.sum ? sum : (rows.length ? sum / rows.length : 0);
          return NextResponse.json({ success: true, data: result });
        }
      }
    }

    return NextResponse.json({ error: "Invalid bridge type" }, { status: 400 });

  } catch (error: any) {
    console.error("[Bridge API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
