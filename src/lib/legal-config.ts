export const LEGAL_CONFIG = {
  appName: "CalcettoXP" as const,
  domain: "www.calcettoxp.com" as const,
  canonicalRoot: "https://www.calcettoxp.com" as const,
  tagline: "Trasforma ogni calcetto nella tua carriera." as const,
  territory: "Italia" as const,
  contactEmail: "calcettoxp@gmail.com" as const,
  privacyContactEmail: "calcettoxp@gmail.com" as const,

  lastUpdated: "2026-09-09" as const,
  lastUpdatedHuman: "9 settembre 2026" as const,

  services: {
    auth: {
      name: "Google OAuth" as const,
      provider: "Google LLC" as const,
      privacyUrl: "https://policies.google.com/privacy" as const,
    },
    database: {
      name: "Neon PostgreSQL" as const,
      provider: "Neon (Kiosk Labs DB, Inc.)" as const,
      privacyUrl: "https://neon.tech/privacy" as const,
    },
    hosting: {
      name: "Vercel Hosting" as const,
      provider: "Vercel Inc." as const,
      privacyUrl: "https://vercel.com/legal/privacy-policy" as const,
    },
    payments: {
      name: "Stripe Payments" as const,
      provider: "Stripe, Inc." as const,
      privacyUrl: "https://stripe.com/privacy" as const,
    },
    storage: {
      name: "Vercel Blob" as const,
      provider: "Vercel Inc." as const,
      privacyUrl: "https://vercel.com/legal/privacy-policy" as const,
    },
  },
} as const;

export type LegalConfigShape = typeof LEGAL_CONFIG;
