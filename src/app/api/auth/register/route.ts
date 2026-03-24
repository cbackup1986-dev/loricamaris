import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateNextUserId } from "@/lib/sdk/idUtils";

/**
 * Headless Registration API for OpenClaw and other agents.
 * 
 * Body: { username, email, password }
 */

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing username, email, or password" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [ { username }, { email } ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username or email already taken" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate custom ID
    const newId = await generateNextUserId();

    // Create user
    const user = await prisma.user.create({
      data: {
        id: newId,
        username,
        email,
        password: hashedPassword,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "User registered successfully",
      userId: user.id 
    });

  } catch (error: any) {
    console.error("[Register API Error]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
