import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { CookieBanner } from "@/components/legal/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070A08" },
    { media: "(prefers-color-scheme: light)", color: "#070A08" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://calcettoxp.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CalcettoXP - Trasforma ogni calcetto nella tua carriera",
    template: "%s | CalcettoXP",
  },
  description:
    "Registra le tue partite di calcetto, fai evolvere la tua card, guadagna XP e costruisci la tua carriera calcistica personale.",
  applicationName: "CalcettoXP",
  generator: "Next.js",
  keywords: [
    "calcetto",
    "calcio a 5",
    "calcio",
    "carriera calcistica",
    "calcetto statistiche",
    "football career",
    "futsal",
    "XP",
    "card giocatore",
    "OVR",
    "Career Index",
    "CalcettoXP",
  ],
  authors: [{ name: "CalcettoXP", url: APP_URL }],
  creator: "CalcettoXP",
  category: "sports",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-touch-icon.svg",
      },
    ],
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    title: "CalcettoXP - Trasforma ogni calcetto nella tua carriera",
    description:
      "Registra le tue partite di calcetto, fai evolvere la tua card, guadagna XP e costruisci la tua carriera calcistica personale.",
    siteName: "CalcettoXP",
    locale: "it_IT",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "CalcettoXP - Trasforma ogni calcetto nella tua carriera.",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CalcettoXP - Trasforma ogni calcetto nella tua carriera",
    description:
      "Registra le tue partite di calcetto, fai evolvere la tua card, guadagna XP e costruisci la tua carriera calcistica personale.",
    creator: "@calcettoxp",
    images: ["/og-default.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "sports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CalcettoXP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="bg-bgPrimary text-textPrimary font-sans antialiased">
        <div className="pitch-wrapper min-h-[100dvh]">
          <SessionProviderWrapper>
            {children}
            <CookieBanner />
          </SessionProviderWrapper>
        </div>
      </body>
    </html>
  );
}
