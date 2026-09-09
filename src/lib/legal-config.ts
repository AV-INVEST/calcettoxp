export const LEGAL_CONFIG = {
  domain: 'calcettoxp.com',
  appName: 'CalcettoXP',
  tagline: 'Trasforma ogni calcetto nella tua carriera.',

  ownerName: '[NOME PROPRIETARIO O RAGIONE SOCIALE]',
  contactEmail: '[EMAIL DI CONTATTO]',
  companyName: '[DENOMINAZIONE AZIENDA - SE APPLICABILE]',
  vatId: '[PARTITA IVA - SE APPLICABILE]',
  address: '[INDIRIZZO FISICO - SE APPLICABILE]',
  territory: 'Italia',

  lastUpdated: '2026-09-09',
  lastUpdatedHuman: '9 settembre 2026',

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
    controllerContactEmailPlaceholder: '[EMAIL CONTATTO PRIVACY]',
  },
} as const;

export type LegalConfigShape = typeof LEGAL_CONFIG;
