import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

/**
 * Agent Token API: Exchange credentials for a Developer Token.
 * 
 * Body: { email, password }
 * Returns: { appKey: "PEAK_..." }
 */

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Use existing token or generate new one
    // @ts-ignore
    let token = user.developerToken;
    
    if (!token) {
      token = `PEAK_${crypto.randomBytes(24).toString('hex')}`;
      await prisma.user.update({
        where: { id: user.id },
        // @ts-ignore
        data: { developerToken: token }
      });
    }

    return NextResponse.json({ 
      success: true,
      appKey: token,
      username: user.username,
      userId: user.id
    });

  } catch (error: any) {
    console.error("[Agent Token API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
