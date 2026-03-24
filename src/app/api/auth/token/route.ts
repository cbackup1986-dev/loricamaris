import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * API to manage Developer Tokens.
 * GET: Get current token (masked)
 * POST: Generate new token
 * DELETE: Revoke token
 */

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // @ts-ignore - developerToken is added in schema
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { developerToken: true, tokenLastUsed: true },
  });

  if (!user?.developerToken) {
    return NextResponse.json({ token: null });
  }

  // Mask the token for safety: PEAK_...XXXX
  const masked = user.developerToken.substring(0, 8) + "..." + user.developerToken.substring(user.developerToken.length - 4);
  
  return NextResponse.json({ 
    token: masked,
    lastUsed: user.tokenLastUsed 
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate a new secure token: PEAK_randomhex
  const newToken = `PEAK_${crypto.randomBytes(24).toString('hex')}`;

  await prisma.user.update({
    where: { id: session.user.id },
    // @ts-ignore
    data: { 
      developerToken: newToken,
      tokenLastUsed: null
    },
  });

  return NextResponse.json({ token: newToken });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    // @ts-ignore
    data: { 
      developerToken: null,
      tokenLastUsed: null
    },
  });

  return NextResponse.json({ success: true });
}
