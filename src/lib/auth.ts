import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] authorize called with:", { username: credentials?.username, passwordLength: (credentials?.password as string)?.length });

        const parsedCredentials = z
          .object({ username: z.string(), password: z.string().min(1) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log("[AUTH] Validation failed:", parsedCredentials.error.message);
          return null;
        }

        const { username, password } = parsedCredentials.data;
        
        // Support login by username OR email
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username },
              { email: username },
            ],
          },
        });
        
        if (!user) {
          console.log("[AUTH] User not found by username or email:", username);
          return null;
        }
        
        console.log("[AUTH] Found user:", user.username);
        
        if (!user.password) {
          console.log("[AUTH] User has no password:", username);
          return null;
        }
        
        const passwordsMatch = await bcrypt.compare(password, user.password);
        console.log("[AUTH] Password match result:", passwordsMatch);

        if (passwordsMatch) {
          // Return an object with the fields NextAuth expects
          return {
            id: user.id,
            name: user.username,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When user first signs in, add username to token
      if (user) {
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.username && session.user) {
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Since we are using a modal
  },
});
