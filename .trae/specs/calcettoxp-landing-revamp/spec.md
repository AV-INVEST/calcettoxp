# Spec: CalcettoXP — Landing Page + UX + Copy + CTA Revamp

## Problema

CalcettoXP è tecnicamente funzionante e deployabile, ma la presentazione visiva e l'esperienza utente non sono all'altezza dell'identità del prodotto. Il sito attualmente:
- Ha un aspetto troppo piatto, scuro e minimale (stile SaaS generico)
- Presenta CTAs non funzionanti o che reindirizzano in modo errato (es. pulsanti pricing con `href="#"`, pulsanti CTA che puntano solo a `#pricing` invece di avviare il flusso di autenticazione)
- Non comunica l'atmosfera "neon stadium" / carriera calcistica ispirata ai giochi
- Ha una sezione demo piatta con un solo giocatore e grafico lineare
- Sottostima il sistema di achievement (solo 7 visibili)
- Non ha un'azione "Accedi" / "Area membri" visibile nell'header
- Non differenzia correttamente il comportamento CTA tra utenti loggati e non loggati
- Ha date legali hardcodate che diventeranno obsolete
- Ha copy in italiano grezzo o "draft-like"

## Utenti e Obiettivi

**Utenti target:**
- Giocatori di calcetto amatoriali 16-40 anni, italiani
- Appassionati di gaming, statistiche sportive, progressioni
- Utenti mobile-first (il prodotto sarà usato principalmente da smartphone)

**Obiettivi della revisione:**
1. Trasformare la percezione da "SaaS minimale" a "prodotto calcistico premium, game-like, eccitante"
2. Far capire il value proposition in meno di 5 secondi
3. Rendere tutti i CTAs principali funzionali e corretti (auth, Stripe, routing)
4. Aumentare la percezione premium e la conversion rate
5. Rendere le pagine legali credibili e pronte per la produzione
6. Ottenere un build TypeScript e Next.js pulito

## Non Obiettivi (espliciti)

- **NON** ricostruire l'architettura da zero
- **NON** toccare backend auth, Prisma schema, webhook Stripe, o logiche lato server esistenti
- **NON** introdurre dipendenze esterne pesanti
- **NON** inventare dati fiscali, P.IVA, indirizzi o dati di società fittizie
- **NON** implementare effettivamente il multiplayer (resta "in arrivo")
- **NON** modificare gli algoritmi di calcolo Career Index / OVR / XP
- **NON** introdurre pay-to-win: PRO resta solo analytics + personalizzazione

## Requisiti Funzionali

### F1. Landing Page Hero Section
- **F1.1** Header sempre visibile con: logo CalcettoXP + azione CTA contestuale
  - Utente loggato: "Vai alla dashboard" (porta a /dashboard o /onboarding se onboarding incompleto)
  - Utente non loggato: "Accedi" o "Inizia gratis" (porta a /api/auth/signin con callbackUrl appropriato)
- **F1.2** Primary CTA con comportamento smart:
  - Guest → avvia Google sign-in (callback: /onboarding se primo accesso, altrimenti /dashboard)
  - Logged-in + onboarding incompleto → /onboarding
  - Logged-in + onboarding completo → /dashboard
- **F1.3** Secondary CTA "Scopri come funziona" → smooth scroll alla sezione #come-funziona
- **F1.4** Hero message: "Trasforma ogni calcetto nella tua carriera" con copy circostante migliorato e più aspirante, in italiano corretto e naturale

### F2. Sezione "Come funziona"
- **F2.1** 3 step: Gioca → Registra → Evolvi
- **F2.2** Ogni step con microcopy migliorato, card design più premium con effetti hover

### F3. Sezione Demo Carriere / Giocatori Esempio
- **F3.1** Almeno 4 giocatori demo con ruoli differenti:
  - Andrea — Attaccante (ATT)
  - Federico — Centrocampista (CEN)
  - Riccardo — Difensore (DIF)
  - Marco — Portiere (POR)
- **F3.2** Interfaccia per navigare/switchare tra i giocatori (tab o pulsanti)
- **F3.3** Ogni giocatore con statistiche diverse appropriate al ruolo
- **F3.4** Grafico Career Index NON lineare: deve mostrare salite e discese realistiche (es. sconfitte → calo, grandi performance → salto)
- **F3.5** Grafico chiaro e non rumoroso, leggibile anche su mobile

### F4. Sezione Evoluzione Card
- **F4.1** Mostrare la progressione da Novizio a Veteran in modo più spettacolare
- **F4.2** Visivamente chiaro su mobile, con indicatori di upgrade path più eccitanti

### F5. Sezione Achievement
- **F5.1** Almeno 12-15 achievement di esempio, coprendo TUTTI i ruoli (non solo attaccanti)
  - Es. inclusi: Prima partita, Prima vittoria, Primo gol, Hat-trick, Assist King, Clean Sheet, Rigore parato, Muro difensivo, Regista, Imbattuto, On Fire, Ironman, Centurion, 1500 Club
- **F5.2** Copy che chiarisce "questi sono solo esempi, ce ne sono molti altri da sbloccare"
- **F5.3** Layout gradevole, premium, con distinzione per categoria/rarità

### F6. Sezione Modalità (Solo Career + Multiplayer)
- **F6.1** Solo Career più accattivante visivamente
- **F6.2** CTA "Inizia ora" con comportamento smart (come F1.2)
- **F6.3** Multiplayer marcato "In arrivo" in modo aspirante

### F7. Sezione Pricing
- **F7.1** Tre piani mantenuti: FREE / PRO Mensile / PRO Annuale
- **F7.2** PRO Annuale visivamente più premium (accenti oro, percepito valore maggiore)
- **F7.3** Pulsanti pricing correttamente cablati:
  - FREE: guest → Google sign-in, logged-in → /dashboard
  - PRO Mensile: guest → sign-in + callback /pricing, logged-in → POST /api/stripe/checkout { plan: "monthly" } → redirect a Stripe
  - PRO Annuale: guest → sign-in + callback /pricing, logged-in → POST /api/stripe/checkout { plan: "yearly" } → redirect a Stripe
- **F7.4** Nessun pulsante con `href="#"` o link morti

### F8. Fix CTA Generali (audit completo)
- **F8.1** Hero primary CTA: comportamento smart auth-aware
- **F8.2** Hero secondary CTA: smooth scroll
- **F8.3** Mobile sticky CTA: comportamento smart auth-aware
- **F8.4** Solo career CTA: comportamento smart auth-aware
- **F8.5** Pricing FREE button: corretto
- **F8.6** Pricing PRO Mensile button: corretto (Stripe checkout mensile)
- **F8.7** Pricing PRO Annuale button: corretto (Stripe checkout annuale)
- **F8.8** Header "Area membri" / "Accedi" / "Vai alla dashboard": corretto
- **F8.9** Nessun CTA che rimanda l'utente alla homepage o a `#` senza azione

### F9. Miglioramento UX Auth/Stripe
- **F9.1** Tutti i punti di ingresso Google sign-in funzionano correttamente
- **F9.2** Callback URL appropriato per ogni scenario (pricing → rimanda a pricing dopo login)
- **F9.3** Pulsanti Stripe mappano correttamente monthly→STRIPE_PRICE_PRO_MONTHLY, yearly→STRIPE_PRICE_PRO_YEARLY
- **F9.4** Compatibilità con modalità sandbox/test preservata
- **F9.5** Logica webhook/portal Stripe esistente non degradata

### F10. Copywriting Miglioramento
- **F10.1** TUTTO il copy visibile in italiano corretto, naturale, persuasivo
- **F10.2** Tono: premium, giovane, sportivo, gaming-ispirato — NON corporate, NON verbose, NON legalese nel prodotto
- **F10.3** Hero copy, how-it-works, achievements, modes, pricing — tutto rielaborato
- **F10.4** Consistenza terminologica in tutto il sito

### F11. Pagine Legali Miglioramento
- **F11.1** Le 4 pagine (Privacy, Termini, Cookie Policy, Disclaimer) devono risultare credibili, strutturate, da produzione
- **F11.2** Data "Ultimo aggiornamento" dinamica: calcolata da server date logic (nessuna API esterna, no hardcode)
- **F11.3** Formattazione, titoli sezione, leggibilità migliorati
- **F11.4** Placeholder puliti in italiano dove mancano dati titolare: `[Dati titolare da completare]`, `[Email di contatto da inserire]` — nessun dato fiscale inventato
- **F11.5** Footer year dinamico

### F12. Design Direction / Visual Identity
- **F12.1** Dark background con ispirazione campo da calcio sintetico (non puro nero piatto dappertutto)
- **F12.2** Accenti neon glow verde (greenElectric)
- **F12.3** Accenti oro SOLO per elementi PRO Annuale / premium
- **F12.4** Pattern sottili linee campo da calcio, gradienti soft
- **F12.5** Animazioni leggere: pulse, glow, hover, scroll reveal (CSS/Tailwind-based, performance-safe)
- **F12.6** Button design migliorato: tipografia forte, icone calcistiche, hover/press states marcati ma leggeri
- **F12.7** NON caotico, NON infantile, NON stock-photo backgrounds

### F13. Mobile-First
- **F13.1** Layout eccellente su mobile prima, desktop secondo
- **F13.2** Spaziature e gerarchia ottimizzate per schermi piccoli
- **F13.3** Pulsanti touch-friendly (≥ 44px height)
- **F13.4** Testi non troppo piccoli
- **F13.5** Grafici responsive e leggibili su mobile
- **F13.6** Nessun grid rotto a larghezze ridotte

### F14. Performance
- **F14.1** Animazioni solo CSS/Tailwind dove possibile
- **F14.2** Nessun asset background pesante
- **F14.3** Impatto bundle ragionevole
- **F14.4** Rispetta prefers-reduced-motion

## Requisiti Non Funzionali

### N1. Integrità Architetturale
- Lavorare all'interno del codebase esistente
- Riutilizzare componenti esistenti dove sensato (Button, Card, Badge, StripeButtons)
- Refactor solo dove necessario
- Nessuna rottura dei flussi backend esistenti (auth, Prisma, Stripe webhook)

### N2. Qualità Codice
- TypeScript strict: nessun `any` non giustificato
- Modulare e pulito
- Componenti nuovi in `src/components/` con naming coerente
- Nessun dead code lasciato

### N3. Validazione Build
- TypeScript check passa (`npx tsc --noEmit` o equivalente via build)
- Prisma generate se necessario
- Production build Next.js passa (`npm run build`)
- Nessun errore diagnostico lint/type critico

### N4. Accessibilità
- Contrasto testo/sfondo adeguato
- Focus states visibili
- Semantica HTML appropriata
- `prefers-reduced-motion` rispettato

## Vincoli e Dipendenze

**Stack fissato (NON cambiare):**
- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM + Neon PostgreSQL
- Auth.js (Google OAuth only)
- Stripe
- Recharts
- Lucide React
- Vercel deployment

**Dipendenze da rispettare:**
- `src/lib/stripe.ts` → Stripe client (NON toccare)
- `src/app/api/stripe/checkout/route.ts` → POST `{ plan: "monthly" | "yearly" }` restituisce `{ ok, url }`
- `src/app/api/auth/[...nextauth]/route.ts` → Auth.js handlers
- `src/app/api/onboarding/status/route.ts` → GET { exists, nickname, ... }
- Variabili env: `NEXT_PUBLIC_APP_URL`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`

## Assunzioni

1. Gli `STRIPE_PRICE_PRO_*` sono configurati correttamente nell'env (non li validiamo nel codice, la route fa già fallback)
2. `next-auth/react` `signIn("google")` funziona come configurato in auth.config.ts
3. Il progetto è in Stripe test mode finché l'utente non lo switcha — manteniamo compatibilità
4. Il PlayerProfile `primaryRole` enum comprende ATT/CEN/DIF/POR (verificato da Prisma)

## Criteri di Accettazione (AC)

### AC: rule (verifiche oggettive binarie)

**AC-R1: Nessun link morto nel pricing / hero / CTA**
- Pass condition: Nessun `<a>` o `<button>` con `href="#"`, `href="undefined"`, o onClick vuoto nelle sezioni landing (hero, how-it-works, demo, modes, pricing) e nel mobile sticky bar.
- Evidence source: Grep for `href="#"` in `page.tsx` + ispezione visuale dei pulsanti.

**AC-R2: Hero primary CTA behavior corretto (auth-aware)**
- Pass condition: Il componente CTA primario usa `useSession` + check onboarding status:
  - `!session.user` → `signIn("google", { callbackUrl: "/" })` oppure router.push("/api/auth/signin")
  - `session.user && !onboarding.exists` → router.push("/onboarding")
  - `session.user && onboarding.exists` → router.push("/dashboard")
- Evidence source: Codice componente CTA nel landing page.

**AC-R3: Header azione membri presente e corretta**
- Pass condition: Header mostra sempre un pulsante a destra del logo; testo e azione variano in base a sessione (Accedi/Vai alla dashboard) come da F1.1.
- Evidence source: Codice header in page.tsx.

**AC-R4: Pricing buttons cablati a Stripe correttamente**
- Pass condition:
  - FREE button → usa logica FreeCTAButton o equivalente (sign-in/dashboard)
  - PRO Mensile button → `POST /api/stripe/checkout` body `{ plan: "monthly" }` → redirect a `data.url`
  - PRO Annuale button → `POST /api/stripe/checkout` body `{ plan: "yearly" }` → redirect a `data.url`
  - Guest → redirect a `/api/auth/signin?callbackUrl=/pricing` PRIMA di chiamare Stripe
- Evidence source: Componente landing pricing + StripeButtons.tsx (gia esistente, verificare integrazione).

**AC-R5: Quattro giocatori demo switchabili con ruoli differenti**
- Pass condition: UI permette di selezionare Andrea (ATT), Federico (CEN), Riccardo (DIF), Marco (POR); ogni selezione cambia nome, ruolo, stat e grafico Career Index associato.
- Evidence source: Codice sezione demo in page.tsx.

**AC-R6: Grafico Career Index demo NON lineare (salite e discese)**
- Pass condition: Almeno 3 dei 4 dataset demo hanno almeno una discesa (valore v minore del punto precedente). Dataset Andrea può essere per lo più in salita ma con almeno 1 calo.
- Evidence source: Dati hardcoded nel file sorgente (array `ciData*` o equivalente).

**AC-R7: Almeno 12 achievement visibili + copy "molti altri"**
- Pass condition: Array achievements.length ≥ 12; copertura ruoli (attaccante, centrocampista, difensore, portiere); testo "E molti altri obiettivi da sbloccare" o equivalente presente nel DOM dopo la griglia.
- Evidence source: Array achievements + testo sezione.

**AC-R8: Date legali dinamiche (no hardcode)**
- Pass condition: `LEGAL_CONFIG.lastUpdated` e `lastUpdatedHuman` sono generati da codice che usa la data corrente (es. `new Date()` a build/runtime) invece di stringhe hardcoded '2026-09-09'. Footer year pure non hardcodato.
- Evidence source: Codice `legal-config.ts` e `AppFooter.tsx`.

**AC-R9: Placeholder dati titolare puliti in italiano**
- Pass condition: Nessun dato fittizio P.IVA/Codice Fiscale/indirizzo/ragione sociale reale. Placeholder nella forma `[Dati titolare da completare]`, `[Email di contatto da inserire]`, `[Indirizzo fisico da completare]`.
- Evidence source: `legal-config.ts` + contenuto 4 pagine legali.

**AC-R10: TypeScript check passa**
- Pass condition: `npx tsc --noEmit` exit code 0, oppure `npm run build` completato senza errori TS.
- Evidence source: Terminal output del comando.

**AC-R11: Next.js production build passa**
- Pass condition: `npm run build` exit code 0.
- Evidence source: Terminal output del comando.

**AC-R12: Nessun CTA rimanda a homepage vuota**
- Pass condition: Tutti i CTAs (hero, sticky, modes, pricing, header) hanno destinazione coerente (auth flow, onboarding, dashboard, Stripe, scroll). Nessun link alla root `/` come fine del percorso a meno che non sia il fallback default appropriato.
- Evidence source: Code review di tutti gli onClick e href.

### AC: rubric (valutazioni qualitative soggettive)

**AC-RU1: Atmosfera visiva "neon stadium / carriera calcistica" (scala 0-3, soglia ≥ 2)**
- 0: Stesso aspetto SaaS piatto di prima
- 1: Miglioramenti minori, ancora piatto
- 2: Percepibile atmosfera campo da calcio, glow verde, pattern linee, CTA con anima — utente capisce immediatamente che è un prodotto calcistico/gaming
- 3: Wow factor forte, eleganza, neon bilanciato, ispira FIFA/Ultimate Team senza plagiare — memorabile
- Pass threshold: ≥ 2
- Evidence source: Screenshot pagina renderizzata / ispezione classi Tailwind CSS applicate.

**AC-RU2: Qualità copy italiano (scala 0-3, soglia ≥ 2)**
- 0: Copy ruvido, inglese mescolato, frasi incomplete
- 1: Grammaticamente corretto ma generico, suona ancora draft
- 2: Italiano naturale, persuasivo, giovane, tono coerente — sportivo/gaming premium
- 3: Copy eccezionale, memorabile,每个sezione comunica valore senza essere verboso
- Pass threshold: ≥ 2
- Evidence source: Lettura di tutti i testi visibili nel landing.

**AC-RU3: Usabilità mobile-first (scala 0-3, soglia ≥ 2)**
- 0: Layout rotto su mobile, testi piccoli, bottoni troppo stretti
- 1: Funzionante ma scomodo, gerarchia non chiara
- 2: Mobile eccellente, gerarchia chiara, bottoni touch-friendly, grafici leggibili, sticky CTA mobile non intrusiva ma sempre raggiungibile
- 3: Esperienza mobile sopra le aspettative, gesture-friendly, nessun scroll section goffo
- Pass threshold: ≥ 2
- Evidence source: Ispettore browser viewport ≤ 390px width + codice responsive.

**AC-RU4: Premium perception pricing annuale (scala 0-3, soglia ≥ 2)**
- 0: Nessuna differenza visiva con mensile
- 1: Piccola distinzione (es. badge solo)
- 2: Distinzione chiara: oro/giallo tenue, border distintivo, highlight "miglior rapporto" percepibile, copy che enfatizza il risparmio
- 3: Piano annuale risulta evidentemente la scelta "migliore per i giocatori seri" senza imbrogliare l'utente
- Pass threshold: ≥ 2
- Evidence source: Screenshot sezione pricing.

**AC-RU5: Performance e leggerezza animazioni (scala 0-3, soglia ≥ 2)**
- 0: Jank, pesantezza, caricamento lento
- 1: Funziona ma alcune animazioni pesanti
- 2: Tutte le animazioni sono CSS/Tailwind-based, fluent, rispettano reduced-motion, nessun asset pesante
- 3: Animazioni a 60fps percepibili, micro-interazioni deliziose, Lighthouse performance presumibilmente alta (non misuriamo ma percepibile)
- Pass threshold: ≥ 2
- Evidence source: Build output size + codice animazioni (solo classi Tailwind/@keyframes, no librerie extra).
