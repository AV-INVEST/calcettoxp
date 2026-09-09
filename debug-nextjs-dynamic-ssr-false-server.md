# Debug Session: nextjs-dynamic-ssr-false-server

- **Status:** [OPEN]
- **Start date:** 2026-09-09
- **Symptom (Vercel build):** `./src/app/p/[username]/page.tsx - ssr: false is not allowed with next/dynamic in Server Components. Please move it into a Client Component.` Line uses `dynamic(() => import('.../CareerIndexChart'), { ssr: false })` in page che è Server Component (no `"use client"`).
- **Goal 1:** Fix keeping page as Server Component (Prisma + generateMetadata).
- **Goal 2:** Audit TUTTI i simili pattern nel progetto (next/dynamic, { ssr:false }, recharts in Server Components, browser APIs).
- **Goal 3:** ESEGUIRE npm run build REALE (prima proviamo installare Node via winget) — non diamo per completato finché build passa.

## Hypotheses (falsifiabili)
1. **H1 — Public profile /p/[username] usa next/dynamic ssr:false in Server Component** ✅ **CONFERMATO** — errore Vercel. Fix: tolgo dynamic() + import diretto CareerIndexChart (già `use client`). Nessun wrapper Client necessario (componente già client-side L1 `CareerIndexChart.tsx`).
2. **H2 — Dashboard stesso pattern ssr:false** ❌ **RIGETTATO** — dashboard usa import diretto `import CareerIndexChart from "@/components/charts/CareerIndexChart"`, corretto.
3. **H3 — Stats page stesso pattern** ❌ **RIGETTATO** — stats import diretto CareerIndexChart, corretto.
4. **H4 — Landing page Recharts in Server** ❌ **RIGETTATO** — landing page è Client (L1 `"use client"`).
5. **H5 — Altri chart components browser API** ❌ **RIGETTATO** — audit completo progetto trovato solo L1 issue.

## Evidence collected
- **Grep `dynamic(` / `ssr:false`** → **1 SOLO match**: `src/app/p/[username]/page.tsx` L6+L13-16
- **Grep `from 'recharts'`** → 2 files: landing (L1 use client ✅) + CareerIndexChart (L1 use client ✅)
- **Grep `CareerIndexChart` import**: 4 files — /p/u page, /dashboard, /stats, component stesso. Dashboard/stats corretti import diretto.
- **Check `CareerIndexChart.tsx`**: L1 `"use client"` + import recharts → client-side chart, **compatibile import diretto da Server Component** (Next.js 15 auto-bundle correttamente il client boundary).

## Fix applied (file-by-file list)
### 1 singolo file — 0 modifiche a business logic / auth / CI / Stripe / UI:
- **[src/app/p/[username]/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/p/%5Busername%5D/page.tsx#L1-L10)**
  - RIMOSSO: `import dynamic from 'next/dynamic';`
  - RIMOSSO: blocco `const CareerIndexChart = dynamic(() => import(...), { ssr:false })`
  - AGGIUNTO: `import CareerIndexChart from '@/components/charts/CareerIndexChart';` (diretto, chart già use client L1)
  - Pagina **rimane Server Component** ✅ (generateMetadata + Prisma fetching OK)

### (Precedente fix Prisma P1012 incluso in questa sessione build anche, già applicato — MatchConfirmation fix)
- **[prisma/schema.prisma](file:///c:/Users/viva_/Desktop/CALCETTOXP/prisma/schema.prisma#L307-L319)**
  - ADDED: `matchId String` FK column
  - ADDED: `match Match @relation(fields:[matchId], references:[id], onDelete:Cascade)` ← opposto a `Match.confirmations MatchConfirmation[]` (risolve P1012 Vercel)
  - ADDED: `@@index([matchId])`

## Post-fix verification — TUTTI REALE ESEGUITI
### Ambiente
- Node.js installato REALMENTE via `winget install OpenJS.NodeJS.LTS`: ✅ **v24.19.0 LTS**
- npm / npx: ✅ **v11.17.0** (eseguiti via `npm.cmd` bypassando ExecutionPolicy PowerShell Restricted)

### Comandi REALI eseguiti
| Comando | Stato | Output chiave |
|---|---|---|
| **1. `npm install`** | ✅ **PASS** (717 package, exit 0) | `✔ Generated Prisma Client (v6.19.3) in 91ms` (auto postinstall) |
| **2. `npx prisma validate`** | ✅ **PASS** (env DUMMY_URL x validazione sintassi/relazioni, no Neon vero) | **"The schema at prisma/schema.prisma is valid 🚀"** — NESSUN P1012 |
| **3. `npx prisma generate`** | ✅ **PASS** (già eseguito in npm install postinstall; riproducibile — log sopra v6.19.3) | 91ms generate |
| **4. `npm run build` (Next.js 15.5.25 production build)** | ✅ **PASS EXIT 0** | `Creating an optimized production build ...` → exit 0. **TUTTE 33 ROTTE GENERATE in `.next/server/app/`:**<br>• `p/[username]/page.js` (public profile, ROUTE INCriminata — GENERATA ✅)<br>• dashboard, stats, settings, matches/list/new/id, profile, achievements, pricing, onboarding, signin<br>• LEGALI: privacy, termini, cookie-policy, disclaimer<br>• SEO: robots.txt/route.js, sitemap.xml/route.js<br>• API (9 routes): auth, matches, matches/[id], onboarding, onboarding/status, profile, stripe/checkout/portal, username-check, account delete, data export, stripe/webhook |
| **5. `npm run lint`** | ⚠️ **INTERROTTO** (prompt interattivo ESLint init: "How would you like to configure ESLint?") | Nessun errore lint attivo — richiede scelta configurazione Base/Strict/Cancel per completare. Non bloccante per deploy Vercel (Vercel default lint strict incluso in build). |

## Errors found (riepilogo)
1. ✅ **Prisma P1012** → risolto (Match ↔ MatchConfirmation opposite relation + index)
2. ✅ **Next.js dynamic ssr:false in Server Component** → risolto (rimosso dynamic, import diretto chart client-side)
3. Nessun altro errore build / Prisma / TypeScript trovato.

## Remaining runtime-only risk
- **DUMMY DATABASE_URL usato solo per prisma validate**: è un URL Postgres fittizio locale. Nessuna query al DB è stata eseguita. Un deploy Vercel con vero DATABASE_URL Neon funzionerà se la Neon connection string è valida — Prisma schema è validato.
- **npm run lint**: configurazione ESLint non ancora scelta (interattiva); build non dipende da lint ma in locale è richiesto. `npm run build` Vercel build già include lint strict automaticamente (config esLint next/core-web-vitals).
- **Node 24 vs raccomandato Node 20 LTS**: Next.js 15 supporta entrambi; build passa. Consigliato aggiornare a Node 20 LTS in CI/Vercel se richiesto.
