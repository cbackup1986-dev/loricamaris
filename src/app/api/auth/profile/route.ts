import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getOrCreateGuestUser } from "@/lib/sdk/idUtils";

/**
 * Profile API: Lookup user information by Developer Token.
 * 
 * Header: Authorization: Bearer PEAK_... (Optional)
 * Returns: { userId, username, email, isGuest }
 */

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const appKey = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!appKey) {
      // Self-healing lookup for Guest Mode
      const guest = await getOrCreateGuestUser();
      return NextResponse.json({
        userId: guest.id,
        username: guest.username,
        email: "guest@system.local",
        isGuest: true,
        message: "No token provided. Running in Public Guest Mode."
      });
    }

    // Find real user
    const user = await prisma.user.findFirst({
      // @ts-ignore
      where: { developerToken: appKey },
      select: { id: true, username: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid developer token" }, { status: 403 });
    }

    return NextResponse.json({
      userId: user.id,
      username: user.username,
      email: user.email,
      isGuest: false
    });

  } catch (error: any) {
    console.error("[Profile API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
