import type { NextAuthConfig } from "next-auth";

// Minimal config for Edge Runtime (middleware) — no DB imports
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/login";
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuth) return true;
      if (isLoginPage) return true;
      if (!isLoggedIn) return false;
      return true;
    },
  },
};
