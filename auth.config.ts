import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.isActive = (user as { isActive?: boolean }).isActive;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || "INVESTOR";
        session.user.isActive = (token.isActive as boolean) ?? true;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnInvestorPortal = nextUrl.pathname.startsWith("/investor-portal");

      // Cast user to extend schema interface
      const user = auth?.user as { email?: string; role?: string; isActive?: boolean } | undefined;

      if (isOnAdmin) {
        if (isLoggedIn && user) {
          // Fallback bypass for admin access via emails directly
          const email = user.email;
          if (email === "helam996@gmail.com" || email === "admin@rubinsons.com") {
            return true;
          }

          const role = user.role;
          return (
            role === "SUPER_ADMIN" ||
            role === "ADMIN" ||
            role === "EDITOR" ||
            role === "INVESTOR_RELATIONS"
          );
        }
        return false; // Redirect to /login
      }

      if (isOnInvestorPortal) {
        if (isLoggedIn) {
          return true;
        }
        return false; // Redirect to /login
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
