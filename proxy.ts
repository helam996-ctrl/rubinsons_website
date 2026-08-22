import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect routes starting with /admin and /investor-portal
  matcher: ["/admin/:path*", "/investor-portal/:path*"],
};
