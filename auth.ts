import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db/client";

declare module "next-auth" {
  interface User {
    role?: string;
    isActive?: boolean;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      isActive: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (dbUser) {
            if (!dbUser.isActive) {
              return false; // Denied (Inactive admin profile)
            }
            return true;
          } else {
            // New user registration - helam996@gmail.com is granted SUPER_ADMIN, others INVESTOR
            await prisma.user.create({
              data: {
                email,
                name: user.name || "",
                role: email === "helam996@gmail.com" ? "SUPER_ADMIN" : "INVESTOR",
                isActive: true,
              },
            });
            return true;
          }
        } catch (e) {
          console.error("Error during NextAuth signIn callback:", e);
          // Local developer bypass fallbacks if DB is offline
          if (email === "helam996@gmail.com" || email === "admin@rubinsons.com") {
            return true;
          }
          return false;
        }
      }
      return false;
    },
    async jwt({ token }) {
      if (token.email) {
        // Fast-path bypass for administrator accounts (online & offline)
        if (token.email === "helam996@gmail.com" || token.email === "admin@rubinsons.com") {
          token.role = "SUPER_ADMIN";
          token.isActive = true;
          return token;
        }

        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.isActive = dbUser.isActive;
          } else {
            token.role = "INVESTOR";
            token.isActive = true;
          }
        } catch {
          token.role = "INVESTOR";
          token.isActive = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || "INVESTOR";
        session.user.isActive = (token.isActive as boolean) ?? true;
      }
      return session;
    },
  },
});
