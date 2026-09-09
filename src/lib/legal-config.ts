function buildLegalConfig() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const lastUpdated = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const monthNames = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  const lastUpdatedHuman = `${day} ${monthNames[month]} ${year}`;

  return {
    domain: 'calcettoxp.com',
    appName: 'CalcettoXP',
    tagline: 'Trasforma ogni calcetto nella tua carriera.',

    ownerName: '[Dati titolare da completare]',
    contactEmail: '[Email di contatto da inserire]',
    companyName: '[Dati titolare da completare]',
    vatId: '[Partita IVA da inserire]',
    address: '[Indirizzo fisico da completare]',
    territory: 'Italia',

    lastUpdated,
    lastUpdatedHuman,

    services: {
      auth: {
        name: 'Google OAuth',
        provider: 'Google LLC',
        privacyUrl: 'https://policies.google.com/privacy',
      },
      database: {
        name: 'Neon PostgreSQL',
        provider: 'Neon (Kiosk Labs DB, Inc.)',
        privacyUrl: 'https://neon.tech/privacy',
      },
      hosting: {
        name: 'Vercel Hosting',
        provider: 'Vercel Inc.',
        privacyUrl: 'https://vercel.com/legal/privacy-policy',
      },
      payments: {
        name: 'Stripe Payments',
        provider: 'Stripe, Inc.',
        privacyUrl: 'https://stripe.com/privacy',
      },
      storage: {
        name: 'Vercel Blob',
        provider: 'Vercel Inc.',
        privacyUrl: 'https://vercel.com/legal/privacy-policy',
      },
    },

    gdpr: {
      controllerContactEmailPlaceholder: '[Email contatto privacy da inserire]',
    },
  } as const;
}

export const LEGAL_CONFIG = buildLegalConfig();

export type LegalConfigShape = typeof LEGAL_CONFIG;
