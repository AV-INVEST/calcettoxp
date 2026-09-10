import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { CookieBanner } from "@/components/legal/CookieBanner";
import AppHeader from "@/components/layout/AppHeader";

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

const SITE_URL = "https://calcettoxp.com";
const SITE_NAME = "CalcettoXP";
const SITE_TITLE = "CalcettoXP – Trasforma ogni calcetto nella tua carriera";
const SITE_DESCRIPTION =
  "Registra le tue partite di calcetto, guadagna XP, fai salire il tuo Career Index e il tuo OVR, colleziona statistiche, trofei e achievement e costruisci la tua carriera calcistica personale.";

const LOGO_URL = `${SITE_URL}/icon.jpg`;
const OG_IMAGE_URL = `${SITE_URL}/opengraph-image.jpg`;
const TWITTER_IMAGE_URL = `${SITE_URL}/twitter-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | CalcettoXP",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "calcetto",
    "calcio a 5",
    "futsal",
    "carriera calcistica",
    "statistiche calcetto",
    "football career",
    "CalcettoXP",
    "XP calcetto",
    "Career Index",
    "OVR",
    "card giocatore",
    "achievement calcetto",
    "trofei calcetto",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.jpg", sizes: "any", type: "image/jpeg" },
      { url: "/icon-192.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/icon-512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [
      { url: "/apple-icon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-icon.jpg",
      },
    ],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "it_IT",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: TWITTER_IMAGE_URL,
        width: 1200,
        height: 675,
        alt: SITE_TITLE,
        type: "image/jpeg",
      },
    ],
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
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.jpg" />
        <link rel="icon" type="image/jpeg" sizes="any" href="/icon.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CalcettoXP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href="https://calcettoxp.com/" />
        <Script
          id="ld-json-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              inLanguage: "it-IT",
            }),
          }}
        />
        <Script
          id="ld-json-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              alternateName: "Calcetto XP",
              url: SITE_URL,
              logo: LOGO_URL,
              image: OG_IMAGE_URL,
              description: SITE_DESCRIPTION,
            }),
          }}
        />
      </head>
      <body className="bg-bgPrimary text-textPrimary font-sans antialiased">
        <div className="pitch-wrapper min-h-[100dvh]">
          <SessionProviderWrapper>
            <AppHeader />
            {children}
            <CookieBanner />
          </SessionProviderWrapper>
        </div>
      </body>
    </html>
  );
}
