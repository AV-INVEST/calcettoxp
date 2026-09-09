import type { NextAuthConfig, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import { getAppBaseUrl } from "@/lib/app-url";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      userId?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

type TokenLike = JWT & { userId?: unknown; sub?: string };

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as TokenLike).userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const tk = token as TokenLike;
      const idValue = (tk.userId ?? tk.sub) as string | undefined;
      const s = session as Session;
      if (idValue && s.user) {
        (s.user as { userId?: string; id?: string }).userId = idValue;
        (s.user as { id?: string }).id = idValue;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const canonical = getAppBaseUrl();
      if (url.startsWith("/")) {
        return `${canonical}${url}`;
      }
      if (url.startsWith(canonical)) {
        return url;
      }
      return canonical;
    },
  },
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

