"use server"

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { generateNextUserId } from "@/lib/sdk/idUtils";

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = registerSchema.safeParse({
    username,
    email,
    password,
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields - " + validatedFields.error.message };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });

  if (existingUser) {
    return { error: "Username or email already exists" };
  }

  const id = await generateNextUserId();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        id,
        username,
        email,
        password: hashedPassword,
      },
    });
    return { success: true, user: { id: user.id, username: user.username } };
  } catch (e) {
    return { error: "Something went wrong" };
  }
}
