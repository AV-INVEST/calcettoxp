import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/signin",
];

const PUBLIC_PREFIXES = [
  "/_next/",
  "/api/auth/",
  "/api/webhook/",
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (/^\/icon-.*\.png$/.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session?.user) {
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Nota: il controllo sull'onboarding (PlayerProfile esistenza)
  // viene demandato alle singole pagine, non al middleware, come richiesto.
  return NextResponse.next();
}

export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-192.png|icon-512.png|).*)",
};
