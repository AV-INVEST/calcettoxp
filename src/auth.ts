import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Nota: NextAuth v5 beta - se tipi differenti in versione finale,
// aggiornare la destrutturazione handlers / callbacks.

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      userId?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.userId = token.userId;
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
