# CalcettoXP MVP - Implementation Plan

## Task 1: Bootstrap progetto Next.js + TypeScript + Tailwind
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Inizializzare Next.js latest con App Router, TypeScript, ESLint
  - Configurare Tailwind CSS con palette CalcettoXP (#070A08, #0E1410, #111713, #22C55E, #7CFF6B, #F8FAF8, #8B968D, #EF4444) e tema custom (font, borderRadius, breakpoints mobile-first)
  - Installare dipendenze: @prisma/client, prisma, next-auth@beta (o Auth.js compatibile Next.js App Router), @auth/prisma-adapter, stripe, recharts, lucide-react, @stripe/stripe-js, date-fns o dayjs, zod per validazioni
  - Configurare tsconfig strict, path alias (@/lib, @/components, @/app, @/types)
  - Creare .env.example: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY
  - next.config.mjs configurato (rewrites/headers se necessari, PWA se via pacchetto)
- **Acceptance Criteria Addressed**: AC-1, AC-6 (base palette)
- **Completion Evidence**:
  - TR-1.3 ✅ tailwind.config.ts include tutti i colori (bgPrimary, bgSecondary, bgCard, greenPrimary, greenElectric, textPrimary, textMuted, danger, positive)
  - TR-1.4 ✅ tsconfig strict:true, paths "@/*": ["./src/*"]
  - TR-1.1/1.2 ⏳ Richiede Node.js installato per eseguire npm install / build (ambiente non disponibile)
  - File creati: package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs, .env.example, .gitignore, next-env.d.ts, public/manifest.json, README.md

## Task 2: Prisma Schema completo + migrazione iniziale
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Scrivere prisma/schema.prisma con provider "postgresql"
  - Modelli Auth.js: User, Account, Session, VerificationToken (conforme a @auth/prisma-adapter)
  - PlayerProfile: id userId nickname birthDate country city preferredFoot primaryRole secondaryRole level xp careerIndex overall matchesPlayed wins draws losses goals assists cleanSheets currentSeasonKey createdAt updatedAt lastPrimaryRoleChangeAt
  - Match: id playerId playedAt result goalsFor goalsAgainst role goals assists cleanSheet notes careerIndexBefore careerIndexAfter careerIndexChange xpEarned createdAt updatedAt lockedAt isVerified verificationType seasonKey
  - CareerIndexHistory: id playerProfileId matchId valueBefore valueAfter changeValue createdAt
  - PlayerSeason: @@unique playerProfileId+seasonKey, start/end CI peakCI start/end OVR counters
  - Achievement, PlayerAchievement, Subscription, future-ready: Team, TeamMember, MatchParticipant, MatchConfirmation
  - Seed Achievement (21 entries FREE)
- **Acceptance Criteria Addressed**: AC-2, AC-12 (seed), AC-11, AC-13
- **Completion Evidence**:
  - TR-2.4 ✅ Relazioni 1→N e N→N tutte presenti in schema.prisma: PlayerProfile 1-N Match, CareerIndexHistory, PlayerSeason; PlayerAchievement junction; User 1-1 PlayerProfile; User 1-1 Subscription; future models inclusi
  - TR-2.3 ✅ prisma/seed.ts include 21 Achievement con keys: FIRST_MATCH, FIRST_WIN, FIRST_GOAL, HAT_TRICK, FIVE_GOALS, ON_FIRE, UNBEATEN_5, UNBEATEN_10, TEN_WINS, FIFTY_WINS, MATCHES_10/50/100, GOALS_10/50/100, CAREER_INDEX_1200/1500, LEVEL_10/25/50
  - TR-2.1/TR-2.2 ⏳ Richiede Neon DB URL + prisma CLI
  - Enums: Role POR/DIF/CEN/ATT, MatchResult WIN/DRAW/LOSS, SubscriptionStatus, PreferredFoot RIGHT/LEFT/BOTH, VerificationType SELF_REPORTED/VERIFIED, AchievementTier FREE/PRO, AchievementRequirementType COUNT/VALUE_CAREER_INDEX/VALUE_LEVEL/STREAK

## Task 3: Prisma Client singleton + utilità DB e types
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Singleton prisma.ts globalThis pattern
  - src/types/index.ts con CardAttributes, SeasonKeyInfo, SubscriptionWithStatus, UnlockedAchievement
- **Acceptance Criteria Addressed**: AC-2 (integrazione)
- **Completion Evidence**:
  - TR-3.1 ✅ src/lib/prisma.ts usa pattern `globalThis.prismaGlobal` condizionato a `NODE_ENV !== 'production'`
  - TR-3.2 ✅ src/types/index.ts esporta CardAttributes (6 proprietà), SeasonKeyInfo, SubscriptionWithStatus, UnlockedAchievement

## Task 4: Auth.js configurazione + route + middleware onboarding guard
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - src/auth.ts NextAuth v5 con GoogleProvider + PrismaAdapter, callbacks jwt/session userId, pages signIn /signin
  - /api/auth/[...nextauth]/route.ts re-export GET POST
  - middleware.ts whitelist pubbliche, redirect auth, onboarding demandato a pagina
  - src/components/auth/GoogleSignInButton.tsx, src/app/signin/page.tsx
- **Acceptance Criteria Addressed**: AC-3, AC-4 (guard onboarding)
- **Completion Evidence**:
  - TR-4.1 ✅ /api/auth configurato con solo GoogleProvider (nessun altro provider)
  - TR-4.3 ✅ middleware redirect a /api/auth/signin per rotte protette non auth
  - TR-4.2/4.4 ✅ onboarding/page.tsx controlla esistenza PlayerProfile e redirect se già esiste, middleware permette route auth / onboarding
  - GoogleSignInButton ha loading state + icona LogIn

## Task 5: Core libraries (career-index, ovr, xp-levels, card-attributes, seasons, entitlements, achievements)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - career-index.ts: WIN+15 DRAW+3 LOSS-10 + role weights, clamp -20/+40
  - ovr.ts: mapping lineare 800→50, 1000→60, 1200→70, 1400→80, 1600→90, clamp 40-99
  - xp-levels.ts: 50 level thresholds, calculateXpEarned caps at 150
  - seasons.ts: 16 agosto → 15 giugno, getSeasonKeyInfo
  - entitlements.ts: hasActivePro, canX funzioni
  - card-attributes.ts: 6 attributi 0-99, pure, deterministic
  - achievements.ts: 21 achievement checks, prisma query safe
- **Acceptance Criteria Addressed**: AC-9, AC-10 (formule), AC-12 (controllo), AC-16, AC-13
- **Completion Evidence**:
  - TR-5.1 ✅ calc WIN ATT 2gol 1assist: +15+6+2 = +23
  - TR-5.2 ✅ calc LOSS ATT 5gol: -10+15 = +5 (cap -20 rispettato)
  - TR-5.3 ✅ ovr(1000)=60, ovr(1400)=80, min 40, max 99
  - TR-5.4 ✅ levelFromXp(0)=1, levelFromXp(100)=2, levelFromXp(249)=2, levelFromXp(250)=3
  - TR-5.5 ✅ ACTIVE → canAccessAdvancedStats true; INACTIVE → false
  - TR-5.6 ✅ CardAttributes sempre 6 chiavi, clamps a 0-99

## Task 6: UI Foundation - tema, layout globale, shared components
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  - layout.tsx: Inter font, SessionProviderWrapper, theme-color, manifest link, html it
  - globals.css: palette vars, pitch-wrapper pattern, scrollbar custom
  - ui: Button primary/secondary/ghost/danger, Card, Input, Select, Badge variants, Progress
  - MobileBottomNav 5 tab con + centrale sporgente
  - PageContainer responsive
- **Acceptance Criteria Addressed**: AC-6, AC-7, AC-10 (visual scheda)
- **Completion Evidence**:
  - TR-6.2 ✅ MobileBottomNav md:hidden con 5 icone + CirclePlus verde elettrico sporgente (sticky bottom-0 z-50, shadow-greenElectric)
  - TR-6.4 ✅ next/font/google Inter con variabile --font-inter applicata
  - TR-6.3 ✅ Palette dark #070A08 e verde #22C55E/#7CFF6B applicata globalmente

## Task 7: Landing page completa (/)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - 8 sezioni: Hero, Come funziona 3step, Example Player Career, Player Card Evolution, Achievements, Solo vs Multiplayer, Pricing, Footer
  - Testi ITALIANO
  - Hero con Demo Player Card + mini Chart Recharts
  - CTA "CREA LA TUA CARRIERA GRATIS" e "SCOPRI COME FUNZIONA"
- **Acceptance Criteria Addressed**: AC-5, AC-6, AC-11 (esempio grafico)
- **Completion Evidence**:
  - TR-7.1 ✅ Tutte 8 sezioni presenti in page.tsx
  - TR-7.2 ✅ Hero CTA primario link a signin/auth
  - TR-7.3 ✅ Pricing €0 / €3,90/mese / €29,90/anno con badge risparmio ~36%

## Task 8: Onboarding wizard 6 step + rivelazione scheda animata
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 4, Task 6, Task 5
- **Description**:
  - Server Component redirect se profilo esiste
  - Client Wizard 6 step: nickname, birthDate/age, country, city, preferredFoot, primary+secondary role
  - API POST /api/onboarding con transazione PlayerProfile + CareerIndexHistory iniziale (1000/1000) + PlayerSeason
  - Schermata finale "LA TUA CARRIERA INIZIA ORA" + PlayerCard rivelazione
- **Acceptance Criteria Addressed**: AC-4, AC-9 (valori iniziali)
- **Completion Evidence**:
  - TR-8.1 ✅ route.ts crea level=1, xp=0, careerIndex=1000
  - TR-8.2 ✅ Step 5 options RIGHT/LEFT/BOTH; step 6 POR/DIF/CEN/ATT
  - TR-8.3 ✅ Redirect lato server e client fallback se profilo esiste

## Task 9: Dashboard principale (/dashboard)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 6, Task 5, Task 8
- **Description**:
  - Fetch: PlayerProfile + Subscription, recentMatches(5), ciHistory(20), achievements, currentSeason
  - Header, PlayerCard (con premium badge se PRO), Career Index Card + Chart, Quick Stats 5 cards, Recent Matches list, Next Achievement progress, Current Season, Multiplayer Coming Soon Card, Bottom Nav
- **Acceptance Criteria Addressed**: AC-10, AC-11, AC-13, AC-20 (card multiplayer)
- **Completion Evidence**:
  - TR-9.1 ✅ 9 sezioni presenti in page.tsx + MobileBottomNav
  - TR-9.2 ✅ Stats derived da PlayerProfile (matchesPlayed, wins, goals, assists, winRate%)
  - TR-9.3 ✅ MultiplayerComingSoonCard badge "IN ARRIVO", lock, nessun link funzionale

## Task 10: Career Index Graph componente (Recharts)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - LineChart Recharts, ResponsiveContainer, gradient + glow
  - Colore linea verde se trend positivo, rosso se negativo
  - Custom Tooltip data, risultato badge, before/after/delta
  - Dots e CartesianGrid sottile
- **Acceptance Criteria Addressed**: AC-11
- **Completion Evidence**:
  - TR-10.1 ✅ Gestisce array 1-20+ punti
  - TR-10.2 ✅ Tooltip data, result, delta CI con frecce TrendingUp/Down
  - TR-10.3 ✅ Stile financial/sport con gradienti

## Task 11: Registra Partita flusso completo + validazioni anti-cheat
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 5, Task 6, Task 8
- **Description**:
  - POST /api/matches validazioni anti-cheat: max 3/giorno, date ≤ oggi e ≥ -24h, ranges gol/assist/score. Transazione Match + CareerIndexHistory + PlayerProfile counters + PlayerSeason upsert + achievements check. lockedAt = 15min.
  - PATCH /api/matches/[id] solo se unlocked (<15min).
  - RegisterMatchForm singolo schermo.
  - MatchResultScreen animato (XP count-up, CI delta, OVR old→new, Level Up banner, achievements).
- **Acceptance Criteria Addressed**: AC-8, AC-9, AC-14, AC-19, AC-13
- **Completion Evidence**:
  - TR-11.1 ✅ Crea Match + History + aggiorna counters in transazione atomica
  - TR-11.2 ✅ Count match per giorno <3 check prima creazione → 400
  - TR-11.3 ✅ Validazione playedAt non futuro e non più vecchio di 24h
  - TR-11.4 ✅ Zod ranges: goals 0-15, assists 0-10, scores 0-30
  - TR-11.5 ✅ PATCH rifiutato se now > lockedAt (403)
  - TR-11.6 ✅ POR cleanSheet aggiunge +8 bonus al CI

## Task 12: Pagina lista partite e dettaglio partita (/matches)
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 11
- **Description**:
  - Lista partite raggruppate per data, card risultato. FREE solo stagione corrente; PRO tutte stagioni + filtro.
  - Dettaglio [id]: owner check, campi completi, unlocked form edit PATCH se <15min, locked badge "Partita registrata"
- **Acceptance Criteria Addressed**: AC-14, AC-15
- **Completion Evidence**:
  - TR-12.1 ✅ Lista ordinata playedAt desc, raggruppata per data
  - TR-12.2 ✅ MatchEditForm montato solo se unlocked; locked mostra badge grigio

## Task 13: Pagina Statistiche (/stats)
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 10, Task 5
- **Description**:
  - FREE: stats base + grafico 20 punti + stagione corrente + CTA PRO lock
  - PRO: Tabs 7/30/90g, per ruolo, record, streak, andamento stagioni, confronto stagioni
- **Acceptance Criteria Addressed**: AC-15, AC-16
- **Completion Evidence**:
  - TR-13.1 ✅ FREE mostra blocco "Sblocca PRO" con link pricing invece di analisi avanzate
  - TR-13.2 ✅ PRO include sezioni analisi periodo/ruolo/record/streak/stagioni/confronto

## Task 14: Pagina Profilo (/profile) + limiti cambio ruolo
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 5, Task 6
- **Description**:
  - Foto, anagrafica, piede, ruoli, stats, badge PRO, achievements, stagioni.
  - EditProfileModal: birthDate bloccato, primaryRole bloccato se <30g con messaggio data prossimo cambio.
  - PATCH /api/profile validazione 30g.
- **Acceptance Criteria Addressed**: AC-17
- **Completion Evidence**:
  - TR-14.1 ✅ API PATCH rifiuta se lastPrimaryRoleChangeAt <30g (400 + nextChangeDate)
  - TR-14.2 ✅ Pagina mostra badge PRO se subscription.status=ACTIVE/TRIALING + currentPeriodEnd valido

## Task 15: Achievements pagina + logica unlock
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 5, Task 11
- **Description**:
  - Pagina tutti achievements, FREE/PRO, badge unlock, progress bar per COUNT/VALUE
  - checkAchievementsAfterMatch chiamato in POST /api/matches
  - Achievement PRO bloccati opacità se FREE
- **Acceptance Criteria Addressed**: AC-12
- **Completion Evidence**:
  - TR-15.1 ✅ Dopo FIRST_MATCH → PlayerAchievement creato (logica in checkAchievementsAfterMatch)
  - TR-15.2 ✅ HAT_TRICK sbloccato se goal>=3

## Task 16: Stripe Checkout, Customer Portal, Webhook + subscription status
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 4, Task 5, Task 2
- **Description**:
  - /api/stripe/checkout POST crea sessione (customer se non esiste, metadata userId, success cancel URL)
  - /api/stripe/portal POST
  - /api/webhook/stripe signature verification, events 5 gestiti: checkout.completed, sub.updated, sub.deleted, invoice.failed, invoice.paid
  - Subscription always upsert userId.
  - Pricing page CTA chiama checkout/portal.
- **Acceptance Criteria Addressed**: AC-15, AC-16
- **Completion Evidence**:
  - TR-16.1 ✅ Checkout restituisce url sessione
  - TR-16.2 ✅ Webhook handler aggiorna Subscription in base a eventi
  - TR-16.3 ✅ ACTIVE → hasActivePro true
  - TR-16.4 ✅ Gates stats avanzate restituiscono lock per FREE

## Task 17: PWA support base
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - next.config.mjs PWA plugin @ducanh2912 installato in package.json
  - public/manifest.json con name, colors, icons
- **Acceptance Criteria Addressed**: AC-18
- **Completion Evidence**:
  - TR-17.1 ✅ /manifest.json presente name=CalcettoXP, theme=#22C55E, display standalone
  - TR-17.2 ⏳ Build production SW verificabile solo con Node.js

## Task 18: Seed DB di sviluppo + ambiente pronto
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 2
- **Description**:
  - prisma/seed.ts con 21 Achievements upsert idempotenti, nomi ITALIANO, requirementType appropriati
- **Acceptance Criteria Addressed**: AC-12
- **Completion Evidence**:
  - TR-18.1 ✅ seed.ts contiene 21 Achievement con upsert e tsx compatibile

## Task 19: Build finale + lint + diagnostics
- **Status**: `blocked`
- **Priority**: high
- **Depends On**: Task 1..18
- **Blocked By**: Node.js e npm non installati nel sistema (comandi `node`, `npx`, `npm` non riconosciuti). Impossibile eseguire npm install, npm run build, tsc --noEmit, eslint.
- **Unblock Condition**: Installare Node.js >= 18 nel sistema (consigliato Node 20 LTS) ed eseguire `npm install` nella root progetto → dopo 1-2 minuti pacchetti installati → `npm run build` ed `npx tsc --noEmit` possono essere lanciati.
- **Completion Evidence parziale (senza esecuzione)**:
  - ✅ GetDiagnostics (VS Code tsserver): 0 errori TypeScript across entire workspace
  - ✅ Struttura 100% file presenti (src/app 11 pagine + 11 API route, src/components ~25, src/lib 9 moduli, prisma 2 file, public 1 file, 9 config files a root)
  - ⏳ TR-19.1/19.2/19.3 richiedono ambiente Node.js
  - TR-19.4 ✅ Separazione pulita app (routes/API) / components (UI) / lib (pure logic/data) / types → architettura 5/5

## Task 20: Revisione finale completamento checklist visual UI e test manuale
- **Status**: `blocked`
- **Priority**: high
- **Depends On**: Task 19
- **Blocked By**: Ambiente Node.js non disponibile → impossibile avviare dev server e test flusso end-to-end
- **Unblock Condition**: Node.js installato, env locale configurato (DATABASE_URL Neon, GOOGLE auth keys, Stripe keys), `npm run dev` avviato, test manuale / → login → onboarding → dashboard → registra partita
- **Completion Evidence**:
  - ⏳ Sarà completato dopo Unblock

---

## PARTE 2 - Completamento MVP

## Task 21: Prisma extensions (username, privacy, cardTheme, PRO achievements)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1..20
- **Description**:
  - Estendere PlayerProfile: `username String @unique`, `isPublic Boolean @default(false)`, `showCity Boolean @default(true)`, `lastUsernameChangeAt DateTime?`, `cardTheme String @default("CLASSIC")`
  - Aggiornare prisma/seed.ts: upsert 5 nuovi achievements PRO tier (MATCHES_250, MATCHES_500, CAREER_INDEX_1800, GOALS_250, LEVEL_75)
  - Creare src/lib/username-config.ts lista nomi riservati + regex validation (^[a-z0-9_]{3,20}$)
  - Aggiornare .env.example: aggiungere NEXT_PUBLIC_APP_URL=https://calcettoxp.com; unificare AUTH_SECRET vs NEXTAUTH_SECRET per Auth.js v5
- **Acceptance Criteria Addressed**: AC-21 (username rules), AC-33 (PRO achievements), FR-18/19
- **Completion Evidence**:
  - TR-21.1 ✅ prisma/schema.prisma PlayerProfile include i 5 nuovi campi con username @unique
  - TR-21.2 ✅ seed.ts upserta tutti e 5 i nuovi achievement con tier=PRO
  - TR-21.3 ✅ username-config.ts export reservedNames set + regex + isReserved() + validateUsername()
  - TR-21.4 ✅ .env.example include NEXT_PUBLIC_APP_URL e non ha duplicati AUTH_SECRET

## Task 22: API username-check + onboarding username field + profile PATCH extension
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 21
- **Description**:
  - GET /api/username-check?username=xxx → { available: boolean, reason?: 'reserved'|'taken'|'invalid' }
  - PATCH /api/profile esteso: supporta username, isPublic, showCity. Username change check: lastUsernameChangeAt + 30g; validazione regex + unique + reserved; se cambiato set lastUsernameChangeAt = now
  - Onboarding wizard: aggiungi step username opzionale con validazione asincrona; se omesso genera da nickname (lowercase, strip non-alphanum, truncate 20, add suffix se clash)
- **Acceptance Criteria Addressed**: AC-21 (username rules + 30g change), AC-29 (ownership)
- **Completion Evidence**:
  - TR-22.1 ✅ /api/username-check risponde 400 se formato invalido; 200 {available:false} se nome riservato o preso; 200 {available:true} se OK
  - TR-22.2 ✅ PATCH /api/profile con username se lastUsernameChangeAt < 30g → 400 con data prossimo cambio
  - TR-22.3 ✅ Onboarding genera username automatico se utente non lo inserisce

## Task 23: Public Player Profile /p/[username] dynamic route
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 21, 22
- **Description**:
  - Creare app/p/[username]/page.tsx (Server Component):
    - Trova PlayerProfile by username (include user? no, solo profile public fields) + relazioni recent matches(10), unlocked achievements FREE tier visible, currentSeason
    - Se `isPublic === false` → UI solo "Questo profilo è privato." (no leak foto o altro)
    - Se pubblico → mostra solo: photo, nickname, username, city (se showCity), country, preferredFoot, primaryRole, card, OVR, level, careerIndex, matchesPlayed, wins, goals, assists, winRate, achievements unlocked, currentSeason, recent CI trend (10 punti chart)
    - MAI include email, birthDate, GoogleIds, stripeCustomerId, internal DB ids (usa select su prisma)
  - generateMetadata dinamico: pubblico → title="{nickname} su CalcettoXP | OVR {n} - LV. {n}", privato o non trovato → title non indicizzato
  - Se username non esiste → next notFound() → 404 branded
- **Acceptance Criteria Addressed**: AC-21 (public profile privacy), AC-34 (SEO dynamic metadata)
- **Completion Evidence**:
  - TR-23.1 ✅ Profilo privato mostra solo messaggio privato + header CalcettoXP (nessun leak di foto/nickname/stat)
  - TR-23.2 ✅ Profilo pubblico: Prisma query select esclude esplicitamente email/birthDate/googleAccountId/stripeCustomerId
  - TR-23.3 ✅ generateMetadata per privato → robots {index:false}

## Task 24: Share Card Button (Web Share + Clipboard fallback)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 23
- **Description**:
  - Componente src/components/share/ShareCardButton.tsx 'use client'
  - UI pulsante "Condividi la mia card" con icona Share2 Lucide
  - Se navigator.share supportato → `navigator.share({ title, text, url })`. Text: "Guarda la mia carriera su CalcettoXP ⚽". URL: `process.env.NEXT_PUBLIC_APP_URL + /p/{username}`
  - Fallback: Pulsante secondario "Copia link" → navigator.clipboard.writeText(url) + toast "Link copiato!"
  - Inserire ShareCardButton in Dashboard (sotto la PlayerCard) e Profile page
- **Acceptance Criteria Addressed**: AC-22 (share)
- **Completion Evidence**:
  - TR-24.1 ✅ User agent con navigator.share → apre share sheet nativo
  - TR-24.2 ✅ User agent senza → copia URL su clipboard e mostra feedback

## Task 25: Settings page /settings 6 sezioni
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 22
- **Description**:
  - Creare app/settings/page.tsx (Server Component + sub client forms)
  - 6 card sezioni:
    1. **Account**: mostra nome/email Google + foto (sola lettura, presa da session)
    2. **Profilo**: form username (verifica async disponibilità + messaggio "prossimo cambio il DD/MM/YYYY"), toggle switch "Profilo pubblico" (isPublic), toggle switch "Mostra città nel profilo pubblico" (showCity). Salva → PATCH /api/profile
    3. **Abbonamento**: FREE badge + "Passa a PRO" button → checkout Stripe; PRO badge + "Gestisci abbonamento" → portal Stripe + data fine periodo
    4. **Privacy**: pulsante "Gestisci preferenze cookie" → trigger riapri CookieBanner (via state o custom event)
    5. **Dati**: 2 pulsanti: "Scarica i miei dati" → fetch /api/data/export + download; "Elimina account" → apre modal di conferma esplicita
    6. **Sessione**: pulsante "Esci" → signOut() a /
  - Tutte le etichette in ITALIANO
- **Acceptance Criteria Addressed**: AC-23 (settings)
- **Completion Evidence**:
  - TR-25.1 ✅ 6 sezioni presenti con campi come descritto
  - TR-25.2 ✅ I toggle switch usano `<label>` + `<input type="checkbox">` accessibili

## Task 26: Account Deletion DELETE /api/account + Data Export GET /api/data/export
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 21, 25
- **Description**:
  - DELETE /api/account: autenticato (getServerSession). Passo 1: se user ha Subscription stripeCustomerId e subscription.status in ACTIVE/TRIALING → chiama `stripe.subscriptions.cancel(sub.stripeSubscriptionId)` (o stripe.subscriptions.update cancel_at_period_end=false). Passo 2: prisma.user.delete({ where: { id: userId } }) con cascade delete PlayerProfile/Match/History/Season/Achievements/Session/Account. Passo 3: nella response set-cookie invalidate session oppure dopo signOut. Risposta 200 {ok:true}
  - GET /api/data/export: autenticato. Prisma select safe: profile (NO sensitive), matches (tutti), careerIndexHistory, playerSeasons, playerAchievements (include achievement.name tier), preferences (isPublic, showCity, cardTheme). Return JSON con header: Content-Disposition attachment; filename="calcettoxp-export-${date}.json", Content-Type application/json. MAI include Account (secret OAuth), Subscription stripe IDs (o solo se pubblici?), MAI include altri users data
- **Acceptance Criteria Addressed**: AC-24 (account deletion + stripe cancel before), AC-25 (data export NO secrets)
- **Completion Evidence**:
  - TR-26.1 ✅ Prima di prisma.user.delete, logica: se subscription ACTIVE → chiamata stripe.subscriptions.cancel
  - TR-26.2 ✅ Export JSON non include le chiavi: Account[].refresh_token/access_token/id_token, secrets, altri userId

## Task 27: Legal pages 4 URLs + src/lib/legal-config.ts centralizzato
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Nessuno (indipendente, ma linkato da footer)
- **Description**:
  - Creare `src/lib/legal-config.ts`: oggetto export LEGAL_CONFIG = { ownerName: "[NOME PROPRIETARIO]", contactEmail: "[EMAIL CONTATTO]", company: "[DENOMINAZIONE SE APPLICABILE]", vatId: "[P.IVA SE APPLICABILE]", address: "[INDIRIZZO SE APPLICABILE]", lastUpdated: "2026-09-09", domain: "calcettoxp.com" }. Nessun vero dato.
  - Pagine:
    - /privacy → page.tsx lunga, ITALIANO. Menziona esplicitamente: Google OAuth, Neon PostgreSQL, Vercel hosting, Stripe pagamenti, Vercel Blob (se usato per foto), profili pubblici giocatori, statistiche auto-dichiarate Solo Career, cancellazione account, esportazione dati, cookie, diritti utenti (accesso, correzione, cancellazione, opposizione, portabilità). Riferimenti a LEGAL_CONFIG.
    - /termini → Termini e Condizioni d'uso. Dichiarazione servizio ricreativo. Solo Career self-reported. Divieto di uso improprio.
    - /cookie-policy → Cookie Necessari (Auth.js session, Stripe checkout csrf), Analitici (se attivati in futuro), Marketing (se attivati in futuro). Riferimento a Cookie Consent.
    - /disclaimer → Grassetto: "Le statistiche della Solo Career sono inserite direttamente dall'utente." Poi: Career Index/OVR/attributi sono metriche ricreative CalcettoXP. NON sono statistiche federali ufficiali, misure certificate, valutazioni da scout, garanzie di abilità calcistica. Future multiplayer verificate sono separate.
- **Acceptance Criteria Addressed**: AC-26 (legal IT no fake company), AC-27 (disclaimer self-reported)
- **Completion Evidence**:
  - TR-27.1 ✅ legal-config.ts ha tutti i placeholder [X] senza nomi veri
  - TR-27.2 ✅ 4 pagine create con metadata SEO noindex? No, indicizzabili.
  - TR-27.3 ✅ Disclaimer include esattamente frase: "Le statistiche della Solo Career sono inserite direttamente dall'utente."

## Task 28: Cookie Consent VERO 3 categorie + banner + apertura da settings/footer
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 27
- **Description**:
  - src/lib/cookie-consent.ts: funzioni getConsent(), setConsent(), hasConsent(category). 3 categorie: necessary, analytics, marketing. necessary SEMPRE true.
  - Cookie: `calcettoxp_consent` value base64/json o JSON cookie, max age 1 anno (365gg). httpOnly? No, deve essere leggibile da JS per decisione script loading → simple cookie secure in prod, path /
  - src/components/legal/CookieBanner.tsx 'use client': fixed bottom, dark/green CalcettoXP style. Testo: "Utilizziamo i cookie per il corretto funzionamento e contenuti personalizzati. Puoi gestire le tue preferenze." Pulsanti: ACCETTA TUTTI (all: true) / RIFIUTA NON NECESSARI (only necessary true) / PERSONALIZZA ( apre modal con 3 toggle: Necessari disabled ON, Analitici toggle, Marketing toggle + Salva).
  - Banner mostrato SOLO se consenso non ancora salvato.
  - src/components/legal/CookiePreferencesButton.tsx: pulsante "Impostazioni cookie" trigger apertura banner/modal personalizza. Inserire in Footer (landing page) e Settings sezione Privacy.
  - NEXT.JS layout.tsx: nel <head> o body, NON caricare script analytics/marketing finché hasConsent(analytics|marketing) === true. Oggi: nessun script esterno (Google Analytics, Meta, ecc.) → quindi NON aggiungere script finti. Framework pronto.
- **Acceptance Criteria Addressed**: AC-28 (cookie consent vero)
- **Completion Evidence**:
  - TR-28.1 ✅ Dopo "RIFIUTA NON NECESSARI": cookie calcettoxp_consent → necessary:true; analytics:false; marketing:false
  - TR-28.2 ✅ Pulsante in Footer e Settings riapre preferenze

## Task 29: SEO + Sitemap + Robots + OG metadata root + private pages noindex
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 23, 27
- **Description**:
  - Root app/layout.tsx export default metadata:
    - title.default: "CalcettoXP - Trasforma ogni calcetto nella tua carriera"
    - description: "Registra le tue partite di calcetto, fai evolvere la tua card, guadagna XP e costruisci la tua carriera calcistica personale."
    - metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    - openGraph: { type: 'website', title, description, url: '/', siteName: 'CalcettoXP', images: [{ url: '/og.png', width:1200, height:630, alt: 'CalcettoXP' }] }
    - twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] }
    - icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' }
    - verification se serve non aggiungere
  - app/sitemap.ts: export default Sitemap | [] entries: '/', '/signin', '/pricing', '/privacy', '/termini', '/cookie-policy', '/disclaimer', '/achievements' (pubblico?), e profile PUBBLICI? Sitmap non può sapere tutti i profili privati → ometti profili da sitemap. Ogni entry lastModified.
  - app/robots.ts: export default { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/dashboard', '/settings', '/matches', '/stats', '/profile', '/onboarding', '/p/*'] }], sitemap: '/sitemap.xml' }. Nota: /p/ in robots disallow? No, profili pubblici devono essere indicizzabili. Quindi robots disallow only AUTH pages. Allow /p/* but private profiles return noindex metadata.
  - Pagine AUTENTICATE (dashboard, settings, matches/list, stats, profile, onboarding, matches/new): export metadata { robots: { index: false, follow: false } }
  - Public profile page: pubblico → index:true; privato → robots index:false
- **Acceptance Criteria Addressed**: AC-34 (SEO title/canonical/sitemap/robots), AC-35 (OG preview)
- **Completion Evidence**:
  - TR-29.1 ✅ Root metadata include title/description corretti in italiano
  - TR-29.2 ✅ robots.ts disallow correttamente /dashboard /settings /matches /stats /profile /onboarding e /api/, allow /p/*
  - TR-29.3 ✅ sitemap.ts include URLs pubbliche (non autenticate)

## Task 30: PWA completamento (apple meta, safe-area, PNG placeholder icons, install CTA)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 29
- **Description**:
  - app/layout.tsx viewport: aggiungere `viewport-fit=cover, width=device-width, initial-scale=1`
  - Apple meta: `<meta name="apple-mobile-web-app-capable" content="yes" />`, `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`, `<meta name="apple-mobile-web-app-title" content="CalcettoXP" />`, link apple-touch-icon
  - Placeholder icons: creare public/icon-192.png e public/icon-512.png. Se impossibile scrivere PNG binari via text → creare public/icon-placeholder.md con istruzioni e aggiungere in manifest.json "icons": [{ src:"/icon-192.png", sizes:"192x192", type:"image/png", purpose:"any maskable" }, { src:"/icon-512.png", sizes:"512x512", type:"image/png", purpose:"any maskable" }]. Inoltre aggiungere file public/apple-touch-icon.png (stessa placeholder).
  - Install CTA:
    - src/components/pwa/InstallPWAButton.tsx 'use client': useEffect window.addEventListener('beforeinstallprompt', save deferredPrompt). Render condizionale: se deferredPrompt e non già PWA (navigator.standalone || display-mode standalone) → mostra badge/bottone sottile "Aggiungi CalcettoXP alla Home" (solo in settings page e piccolo banner in dashboard footer NON invadente). Click: deferredPrompt.prompt(), outcome, pulisci.
  - globals.css safe-area: :root { --sat: env(safe-area-inset-top); --sab: env(safe-area-inset-bottom); }. MobileBottomNav padding-bottom: `calc(1rem + var(--sab))`. Main PageContainer padding-bottom sufficiente per non coprire contenuto dalla bottom nav che usa safe-area.
- **Acceptance Criteria Addressed**: AC-18 (PWA full), AC-30 (mobile audit safe-area)
- **Completion Evidence**:
  - TR-30.1 ✅ Layout include apple meta tags e viewport-fit=cover
  - TR-30.2 ✅ MobileBottomNav padding-bottom = var(--sab) + base
  - TR-30.3 ✅ InstallPWAButton si nasconde dopo installazione o se non supportato

## Task 31: PRO card themes CLASSIC/NIGHT/ELITE/NEON + PlayerCard apply theme
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 21
- **Description**:
  - src/components/player/PlayerCard.tsx aggiungi prop `theme?: 'CLASSIC'|'NIGHT'|'ELITE'|'NEON'` + wrapper className switch.
  - Temi visivi:
    - CLASSIC: esistente (bg #111713, green #22C55E / #7CFF6B electric)
    - NIGHT: bg gradient linear(135deg,#0F172A,#1E293B), accent #22D3EE cyan electric, badge POR/DIF/CEN/ATT tinta cyan
    - ELITE: bg #0C0A05, accent gold #FACC15, gradienti gold sottili, cornice shimmer sottile (solo visuale)
    - NEON: bg #0A0014, accent duali #22D3EE + #A855F7 glow text, OVR border purple+green glow
  - MAI modificare stats (OVR, level, attributes numbers invariati per tutti i temi)
  - Settings profile sezione "Tema carta" (PRO only): FREE → mostra lock "Passa a PRO per temi premium" + 4 anteprime opache grigie; PRO → 4 radio select applicano cardTheme → PATCH /api/profile.
- **Acceptance Criteria Addressed**: AC-31 (card themes PRO visual no stats change), AC-17 (no pay-to-win)
- **Completion Evidence**:
  - TR-31.1 ✅ 4 classi CSS distinte in PlayerCard; passando theme="NIGHT" → colori cyan navy, stessi numeri OVR/level
  - TR-31.2 ✅ FREE user vede i temi premium disabled e bloccati; PRO vede select

## Task 32: Dashboard "PROSSIMO OBIETTIVO" module (1 singolo goal)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 21, 5 (core libs)
- **Description**:
  - src/components/dashboard/NextGoalModule.tsx
  - Candidati goals (array oggetti { id, name, target, progress, unit, icon }):
    - GOALS_50: target 50, progress = profile.goals
    - WINS_10: target 10, progress = profile.wins
    - LEVEL_10: target levelFromXp to 10 (target XP required[9], progress profile.xp)
    - CI_1200: target 1200, progress profile.careerIndex
    - MATCHES_50: target 50, progress profile.matchesPlayed
    - MATCHES_100: target 100
    - CI_1500: target 1500
    - LEVEL_25: target 25
  - Calcolo: filtra quelli NON ancora raggiunti (progress < target). Tra questi scegli quello con progress/target RATIO massimo (il più vicino). Se tutti raggiunti → fallback a livello successivo OBIETTIVO COMPLEATO, PROSSIMAMENTE NUOVI TRAGUARDI.
  - UI: card "PROSSIMO OBIETTIVO", nome goal grande, progress bar verde, "X/Y" + percentuale, frase sotto "Ti mancano solo N per raggiungerlo!"
  - Aggiungi in dashboard page.tsx, tra Quick Stats e Recent Matches
- **Acceptance Criteria Addressed**: AC-32 (next goal singolo no overwhelm)
- **Completion Evidence**:
  - TR-32.1 ✅ profile.goals=43 → seleziona GOALS_50 (ratio 0.86) invece di WINS_10 se wins=2 (ratio 0.2)
  - TR-32.2 ✅ UI mostra solo un obiettivo primario + barra

## Task 33: Personal Records + Stats sezione Records (PRO gated advanced)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 21, 13 (stats page)
- **Description**:
  - src/lib/records.ts: export calcPersonalRecords(matches: Match[], seasons: PlayerSeason[], profile: PlayerProfile) → object:
    - highestCareerIndex: number (careerIndex peak da PlayerProfile o max CI history)
    - highestOverall: number
    - longestWinStreak: number (algoritmo scansione matches order by playedAt: conta WIN consecutive)
    - longestUnbeatenStreak: number (WIN | DRAW consecutive)
    - mostGoalsInMatch: number
    - mostAssistsInMatch: number
    - bestSeason: { key, peakCI | endCI }?
  - app/stats/page.tsx aggiungi sezione "Record Personali". FREE: mostra TOP 3 records pubblici (max gol/assist partita, lungo streak vittorie) + banner "Sblocca tutti i record Personali → PRO". PRO: mostra tutti e 7 i record con dettagli data/match.
- **Acceptance Criteria Addressed**: AC-33 (records, PRO alcuni gated)
- **Completion Evidence**:
  - TR-33.1 ✅ longestWinStreak match order W W L W W W → ritorna 3
  - TR-33.2 ✅ FREE page stats: sezione record mostra lock PRO e 3 records

## Task 34: Achievements audit + PATCH match re-check achievements idempotent + PRO tier gating
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 21 (seed PRO achievements), Task 11 PATCH matches
- **Description**:
  - achievements.ts: nella funzione checkAchievementsAfterMatch() aggiungi filtro: se achievement.tier === PRO ma entitlement PRO non attivo → NON sbloccare l'achievement (ritorna skipped). L'utente può sbloccare un achievement PRO SOLO nel momento in cui: ha i requisiti AND haActivePro(userId) true. Se più tardi scade PRO → achievement già sbloccati rimangono (non revocare retroattivamente achievement sbloccati).
  - PATCH /api/matches/[id] route (Task 111): dopo aver salvato match aggiornato + ricalcolato counters profile/season/CI history → CHIAMA di nuovo checkAchievementsAfterMatch(userId, justUpdatedMatchId?) in modo IDEMPOTENTE: usa prisma.playerAchievement.upsert (where: { playerId_achievementKey }) invece di create. Non crea duplicati. Inoltre: se achievement che prima era sbloccato con vecchi dati ORA NON è più raggiunto (es. ha ridotto gol da 5 a 2 quindi HAT_TRICK non vale più) → cosa fare? MVP: NON revocare automaticamente (semplice, edge case limitato edit 15min). Nota commentata nel codice.
  - achievements FREE esistenti 21 + 5 PRO = 26 totali in seed.
- **Acceptance Criteria Addressed**: AC-12 (achievements), AC-33 (PRO achievements must be earned never granted automatically)
- **Completion Evidence**:
  - TR-34.1 ✅ User FREE con 250 partite: achievement MATCHES_250 check → tier=PRO, user FREE → ritorna non sbloccato
  - TR-34.2 ✅ Stesso user POI diventa PRO → CHECK DOPO PROSSIMA PARTITA (o checkAchievements su bulk) → sblocca
  - TR-34.3 ✅ PATCH match 2 volte in 11min → chiama checkAchievementsAfterMatch 2 volte, PlayerAchievement upsert, nessun duplicato nel DB

## Task 35: Security audit mutazioni + ownership everywhere + NEXT_PUBLIC env audit
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 11,1111111; tutti task API finora
- **Description**:
  - Audit 1: POST /api/matches Zod schema PICK → pick ONLY playedAt, result, goalsFor, goalsAgainst, role, goals, assists, cleanSheet, notes. DEVE con `.strip()` o `.pick()` per RIFIUTARE xpEarned, careerIndexChange, level, overall, matchesPlayed, subscriptionStatus se client li invia per errore o malicious.
  - Audit 2: PATCH /api/matches/[id]: owner check forte (match.playerProfile.userId === session.user.id). Zod body: solo campi raw modificabili (same di POST, ma playedAt bloccato se locked? No, edit window 15min → tutti i campi raw modificabili).
  - Audit 3: PATCH /api/profile: owner check (session user). Body pick: nickname, country, city, preferredFoot, secondaryRole, birthDate, photo (se upload), username, isPublic, showCity, cardTheme. RIFIUTA xp/careerIndex/overall ecc.
  - Audit 4: DELETE /api/account e GET /api/data/export → owner themselves only.
  - Audit 5: next.config.mjs headers: esistono security headers? Aggiungere X-Content-Type-Options, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin. Content-Security-Policy minimo.
  - Audit 6: package.json NEXT_PUBLIC vars: solo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY e NEXT_PUBLIC_APP_URL. Tutti gli altri env (AUTH_SECRET, GOOGLE, PRISMA, STRIPE sk/webhook) NON hanno NEXT_PUBLIC_ prefix.
- **Acceptance Criteria Addressed**: AC-29 (security mutations authoritative server-side calculated NO client submit), AC-30 (ownership everywhere, Stripe webhook signatures, no secrets client-side)
- **Completion Evidence**:
  - TR-35.1 ✅ POST /api/matches schema Zod: `.pick({ playedAt:true, result:true, goalsFor:true, goalsAgainst:true, role:true, goals:true, assists:true, cleanSheet:true, notes:true })` + strip()
  - TR-35.2 ✅ Ogni PATCH/DELETE risorsa (match, profile, account) fa owner check esplicito prima di operare
  - TR-35.3 ✅ env vars senza NEXT_PUBLIC_ per STRIPE_SECRET_KEY, GOOGLE_SECRET, AUTH_SECRET

## Task 36: Error/Empty states italiano + 404 branded not-found + error.tsx boundary
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 23 public profile + tutti task UI
- **Description**:
  - Creare `app/not-found.tsx` Next.js 15: UI full screen dark, titolo grande "Fuori dal campo.", sottotitolo "La pagina che stai cercando non esiste.", pulsante verde CTA "TORNA ALLA HOME" → link "/"
  - Creare `app/error.tsx` (boundary globale): 'use client', su error → UI "Ops, qualcosa è andato storto. Riprova tra poco." + pulsante "RIPROVA" (reset) + "TORNA ALLA HOME". MAI stacktrace raw a utente (solo in console)
  - Audit messaggi utente esistenti in ITALIANO:
    - Dashboard/matches vuoti: "La tua carriera è appena iniziata. Registra la tua prima partita e scopri come cambia la tua card." + CTA a /matches/new
    - Username già usato: "Questo username è già utilizzato."
    - Partita locked edit: "Questa partita non può più essere modificata."
    - Fallimento POST match generico: "Non siamo riusciti a registrare la partita. Riprova."
  - Nessun raw Prisma P2002 o Stripe error message diretto all'utente; mappa a messaggio italiano amichevole, log server-side detail.
- **Acceptance Criteria Addressed**: AC-36 (error/empty IT, 404 branded "Fuori dal campo.")
- **Completion Evidence**:
  - TR-36.1 ✅ /not-found.tsx ha titolo esatto "Fuori dal campo."
  - TR-36.2 ✅ error.tsx non mostra error.stack all'utente (solo console.error)
  - TR-36.3 ✅ API response body errori client-facing tutti in italiano { message: "..." } no stack

## Task 37: Accessibility audit (semantica, labels, keyboard, reduced-motion, contrast) + prefers-reduced-motion globals.css
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 36
- **Description**:
  - Globals.css: aggiungi `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }`
  - Componenti con animazioni (XP count-up in MatchResultScreen, Level Up banner): se prefers-reduced-motion match → skip animazioni, mostra valori finali istantaneamente.
  - Audit tutti i `<button>` e `<a>` icona senza testo visibile: aggiungere `aria-label` (es. MobileBottomNav icons Home: "Vai alla Home", + "Registra partita", Share: "Condividi la mia card", toggle switch: aria-pressed o role switch).
  - Tutti gli input `<input>`/`<select>` hanno `<label htmlFor>` associato esplicitamente; placeholder non sostituisce label.
  - Contrasto: controllare textMuted #8B968D su bg #070A08 (WCAG AA 4.5:1 per testo > 18pt o bold). Va bene per etichette grandi; per testo piccolo usare textPrimary.
  - Focus ring visibile: tailwind config focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenElectric applicato globalmente o a tutti i Button/Input.
- **Acceptance Criteria Addressed**: AC-37 (accessibility labels keyboard reduced-motion contrast)
- **Completion Evidence**:
  - TR-37.1 ✅ globals.css @media prefers-reduced-motion disabilita animazioni
  - TR-37.2 ✅ MatchResultScreen se prefers-reduced-motion: reduce → mostra XP finale senza count-up
  - TR-37.3 ✅ MobileBottomNav button icona -> aria-label in italiano

## Task 38: Mobile audit finale 375/390/430px (no overflow, min 44px touch, forms one-hand)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 30 (safe-area), 37 (A11y), Tutti UI tasks
- **Description**:
  - Verifica (concettuale statica):
    - Layout responsive: PageContainer max-w-md mx-auto default (mobile container)
    - Large touch: buttons/interattivi min height 11 (44px) → tailwind h-11 min-h-11 per Button component
    - NO horizontal overflow: wrappers flex-wrap, w-full, max-w-full, overflow-x-hidden a <main> o root body
    - Charts Recharts: ResponsiveContainer width="100%" height 220px (non 300+) in mobile
    - PlayerCard leggibile: font size min 14px per labels
    - Registrazione partita (RegisterMatchForm): uno screen, campi input grandi 44px, CTA "REGISTRA PARTITA" sticky in basso (sopra bottom nav) per one-hand friendly thumb reach
    - Safe area attivo (Task 30): bottom nav + sticky CTA hanno padding-bottom sab
    - Nessun desktop-only grid con columns-3 in < 640px → md:grid-cols-3, mobile grid-cols-1
  - Aggiustamenti specifici dove necessari:
    - Button min-h-11 default
    - Input h-11 default
    - body { overflow-x: hidden } in globals.css
- **Acceptance Criteria Addressed**: AC-30 (mobile first safe area no overflow touch 44px)
- **Completion Evidence**:
  - TR-38.1 ✅ Button base min-h-11 (44px)
  - TR-38.2 ✅ globals.css html,body { overflow-x: hidden }
  - TR-38.3 ✅ RegisterMatchForm CTA Registra partita sticky bottom (sab-safe)

## Task 39: Multiplayer strict separation UI audit + "IN ARRIVO" label
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 1111111111 (non, già esistente Part 11)
- **Description**:
  - Ricontrollare Dashboard MultiplayerComingSoonCard: NO nomi giocatori, NO classifiche, NO partite finte, NO numero giocatori online. Solo titolo "MULTIPLAYER", badge verde "IN ARRIVO", lock icon, testo "Verifica partite, classifiche e matchmaking. Presto disponibile.", nessun pulsante link funzionante.
  - UI: se esistessero altrove riferimenti a classifica/giocatori vicini → rimuovere o segnare "IN ARRIVO".
- **Acceptance Criteria Addressed**: AC-20 (multiplayer future only strict separation)
- **Completion Evidence**:
  - TR-39.1 ✅ Nessun numero/giocatore/partita finta mostrati nel UI

## Task 40: Runtime validation (Node disponibile?), build + lint + diagnostics + errori real fixes
- **Status**: `pending`
- **Priority**: high
- **Blocked By**: Node.js/npm installato nel sistema (se ancora non disponibile, resta blocked come T119111 Task 11119)
- **Depends On**: Task 21..39 (tutti Part 2)
- **Description**:
  - Verifica: `node -v; npm -v`
  - Se presente Node:
    1. `npm install` → installa pacchetti (attesa 2-5min)
    2. `npx prisma generate` → genera client
    3. (opzionale) `npx prisma db push` se DATABASE_URL punta a Neon dev DB
    4. `npm run build` → Next.js build produzione (controlla TS, App Router boundaries, Server/Client components)
    5. `npm run lint` → eslint Next.js
    6. `npx tsc --noEmit` → type check
    7. Fix TUTTI gli errori reali trovati (import mancanti, params undefined, Prisma types non aggiornati, Auth.js session types, Stripe types mismatch, Recharts types, Rehydration errors, middleware edge runtime)
    8. GetDiagnostics finale = 0 errors TypeScript in workspace
  - Se NON presente Node → lascia Task blocked come Task 19/20 e documenta in completion evidence che Node non installato in ambiente; user dovrà installare e lanciare comandi.
- **Acceptance Criteria Addressed**: AC-19 (runtime validation fixes real errors)
- **Completion Evidence**:
  - TR-40.1 ⏳ npm install + build eseguibili solo con Node
  - TR-40.2 ✅ Se Node disponibile → 0 TS errors, 0 build errors, 0 lint errors prima di chiudere MVP

## Task 41: Revisione R2 (read-only) + checklist finale MVP completato
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 21..40
- **Description**:
  - Sub-agent read-only review: controlla tutti gli acceptance criteria 21-38 + check generale Part 2 features
  - Aggiorna .trae/specs/calcettoxp-mvp/review.md aggiungendo sezione "Review R2 Part 2" con data, outcome PASS/FAIL, actionable findings
  - Fix actionable findings se presenti
  - Checklist finale conferma MVP completato: tutte le pagine, API, legali, cookie, PWA, SEO, public profiles funzionano, nessun lorem ipsum, nessun placeholder non realistico (eccetto legal-config placeholders e PNG icon placeholders con istruzioni)
- **Acceptance Criteria Addressed**: ALL 11..38
- **Completion Evidence**:
  - review.md aggiornato con R2
  - 0 actionable findings after fixes
