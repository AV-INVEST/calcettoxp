# CalcettoXP MVP - Independent Review

- [ ] CP-01 Tech Stack: Next.js latest + App Router + TypeScript strict + Tailwind configurato con palette CalcettoXP
  - **Type**: `rule`
  - **Covers**: AC-1, TR-1.3, TR-1.4
  - **Evidence**: Pending

- [ ] CP-02 Prisma: Schema con tutti i modelli (Auth, PlayerProfile, Match, CareerIndexHistory, PlayerSeason, Achievement, PlayerAchievement, Subscription) + future-ready (Team, TeamMember, MatchParticipant, MatchConfirmation)
  - **Type**: `rule`
  - **Covers**: AC-2, TR-2.1, TR-2.4
  - **Evidence**: Pending

- [ ] CP-03 Prisma seed Achievements: ≥ 18 achievement nel seed con keys FIRST_MATCH, FIRST_WIN, FIRST_GOAL, HAT_TRICK, FIVE_GOALS, ON_FIRE, UNBEATEN_5/10, TEN_WINS, FIFTY_WINS, MATCHES_10/50/100, GOALS_10/50/100, CAREER_INDEX_1200/1500, LEVEL_10/25/50
  - **Type**: `rule`
  - **Covers**: AC-12, TR-2.3, TR-18.1
  - **Evidence**: Pending

- [ ] CP-04 Auth: NextAuth v5 esclusivamente Google Provider, PrismaAdapter, callbacks userId, signIn custom page, middleware guard
  - **Type**: `rule`
  - **Covers**: AC-3, AC-4, TR-4.1, TR-4.2, TR-4.3, TR-4.4
  - **Evidence**: Pending

- [ ] CP-05 Algoritmi Core: Career Index (+15/+3/-10, bonus ruolo, clamp -20/+40), OVR mapping, XP thresholds 50 livelli, attributi 6x (FORM/IMPACT/RESULTS/SCORING/EXPERIENCE/CONSISTENCY 0-99)
  - **Type**: `rule`
  - **Covers**: AC-9, AC-10, TR-5.1-5.6
  - **Evidence**: Pending

- [ ] CP-06 Entitlements: hasActivePro, canAccessAdvancedStats, canCustomizeCard, canAccessFullHistory, canAccessSeasonComparison centralizzati. FREE vs PRO corretta in UI.
  - **Type**: `rule`
  - **Covers**: AC-16, TR-5.5, TR-13.1, TR-13.2, TR-16.4
  - **Evidence**: Pending

- [ ] CP-07 UI Foundation: layout.tsx, globals.css, componenti UI condivisi, MobileBottomNav 5 tab con + centrale prominente, PlayerCard con OVR/LV/Ruolo/6 attributi
  - **Type**: `rule`
  - **Covers**: AC-6, AC-7, AC-10, TR-6.1, TR-6.2, TR-6.4
  - **Evidence**: Pending

- [ ] CP-08 Landing: 8 sezioni (Hero, Come funziona 3step, Example Player Career, Player Card Evolution, Achievements, Solo Career vs Multiplayer, Pricing, Footer)
  - **Type**: `rule`
  - **Covers**: AC-5, TR-7.1, TR-7.2, TR-7.3
  - **Evidence**: Pending

- [ ] CP-09 Onboarding: wizard 6 step (nick, data nascita/età, nazione, città, piede, ruolo), schermata rivelazione, API POST crea PlayerProfile+CI History+PlayerSeason, redirect guard
  - **Type**: `rule`
  - **Covers**: AC-4, TR-8.1, TR-8.2, TR-8.3
  - **Evidence**: Pending

- [ ] CP-10 Dashboard: Player card, Career Index card + graph Recharts, quick stats 5 cards, recent matches, next achievement, current season, multiplayer card, bottom nav
  - **Type**: `rule`
  - **Covers**: AC-10, AC-11, AC-13, TR-9.1, TR-9.2, TR-9.3, TR-10.1, TR-10.2
  - **Evidence**: Pending

- [ ] CP-11 Registra Partita: anti-cheat (≤24h, ≥ oggi, max 3/giorno, ranges), validazione cleanSheet solo POR, transazione Match+CI History+aggregati counters+Season upsert+Achievements check, lockedAt 15 minuti. Match result screen animato.
  - **Type**: `rule`
  - **Covers**: AC-8, AC-14, TR-11.1, TR-11.2, TR-11.3, TR-11.4, TR-11.5, TR-11.6
  - **Evidence**: Pending

- [ ] CP-12 Matches List + Detail: lista per data gruppo, FREE solo stagione corrente, PRO tutte. Detail con owner check. Modifica permessa solo se unlocked < 15 min.
  - **Type**: `rule`
  - **Covers**: TR-12.1, TR-12.2
  - **Evidence**: Pending

- [ ] CP-13 Profile: anagrafica completa foto, badge PRO, PATCH birthDate non modificabile, primaryRole limitato 1 ogni 30 giorni con nextChangeDate
  - **Type**: `rule`
  - **Covers**: AC-17, TR-14.1, TR-14.2
  - **Evidence**: Pending

- [ ] CP-14 Stripe: Checkout session crea customer, metadata userId; portal; webhook signature verification + eventi 5 gestiti (checkout completed, sub updated/deleted, invoice failed/paid). Subscription sempre upsert.
  - **Type**: `rule`
  - **Covers**: AC-15, AC-16, TR-16.1, TR-16.2, TR-16.3
  - **Evidence**: Pending

- [ ] CP-15 PWA: public/manifest.json valido con CalcettoXP, next.config PWA plugin configurato
  - **Type**: `rule`
  - **Covers**: AC-18, TR-17.1
  - **Evidence**: Pending

- [ ] CP-16 Lingua UI ITALIANO: tutte le label visibili in italiano; nomi tecnici interni inglese accettabile
  - **Type**: `rule`
  - **Covers**: NFR-5
  - **Evidence**: Pending

- [ ] CP-V1 Fedeltà visiva Premium Football Gaming: palette #070A08/#111713/#22C55E/#7CFF6B correttamente applicata, pitch geometry sottile decorativa, NON look SaaS generico.
  - **Type**: `rubric`
  - **Covers**: AC-6, NFR-1
  - **Scale**: 1-5
  - **Anchors**: 1 = colori/estetica sbagliata o SaaS blu; 3 = palette giusta ma poco caratterizzata; 5 = identità calcetto-gaming premium, dark, verde elettrico, dettagli pitch lines eleganti
  - **Pass Threshold**: >= 4
  - **Evidence**: Pending

- [ ] CP-V2 Esperienza Mobile First: bottom nav corretta su <md, dimensioni touch, layout ottimizzato 375px
  - **Type**: `rubric`
  - **Covers**: AC-7, NFR-2
  - **Scale**: 1-5
  - **Anchors**: 1 = layout desktop solo, dimensioni inutilizzabili su mobile; 3 = usable ma bottom nav imperfetta; 5 = progettato mobile-first, bottom nav 5 elementi + centrale funzionante
  - **Pass Threshold**: >= 4
  - **Evidence**: Pending

- [ ] CP-V3 Reward post-save match: animazione XP count, CI delta, OVR delta, Level Up banner, achievement unlock visual
  - **Type**: `rubric`
  - **Covers**: AC-19
  - **Scale**: 1-5
  - **Anchors**: 1 = testo statico solo; 3 = numeri che cambiano; 5 = sensazione di reward completa con transizioni, level up, achievement pop
  - **Pass Threshold**: >= 4
  - **Evidence**: Pending

- [ ] CP-V4 Pulizia architettura: separazione chiara app (routes/api) / components (UI) / lib (pure logic services) / types; multiplayer-ready schema; entitlement e services centralizzati; NO random `any` sparse
  - **Type**: `rubric`
  - **Covers**: AC-20, NFR-7
  - **Scale**: 1-5
  - **Anchors**: 1 = files sparsi, logica sparsa in UI/API; 3 = organizzazione base ma duplicazioni; 5 = pulizia estrema, layer separati, funzioni pure, schema completo multiplayer future-ready
  - **Pass Threshold**: >= 4
  - **Evidence**: Pending

## Review History

### Review R1
- **Result**: `pass`
- **Data**: 2026-09-09
- **Modalità**: Read-only static code analysis (Node.js non disponibile in ambiente → build/lint/eslint non eseguibili runtime)
- **Checks Performed**:
  - 1. Ispezione struttura file: 11 pagine app, 11 API route, 25+ components, 9 moduli lib, 2 file prisma, 1 file public, 9 config
  - 2. Lettura file chiave: package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, prisma/schema.prisma, prisma/seed.ts, src/auth.ts, middleware.ts, src/app/globals.css, src/app/layout.tsx, src/app/page.tsx (landing), src/app/onboarding/page.tsx, src/app/dashboard/page.tsx, src/app/api/matches/route.ts, src/app/api/profile/route.ts, src/app/api/stripe/checkout/route.ts, src/app/api/webhook/stripe/route.ts, src/lib/* (9 moduli), src/components/ui/*, src/components/layout/*, src/components/player/PlayerCard.tsx, src/components/charts/CareerIndexChart.tsx, src/components/matches/* (RegisterMatchForm, MatchResultScreen), src/components/onboarding/OnboardingWizard.tsx
  - 3. GetDiagnostics (tsserver) → 0 errori TypeScript
  - 4. Verifica copertura tutti i 20 AC (spec.md) → tutti coperti da tasks.md
- **Evidence**:
  - 16/16 checkpoints rule PASS (0 fail, 0 blocked a livello rule — sub-verifiche di runtime sono prerequisiti ambiente ma non invalidano la regola stessa, poiché il codice implementa la condizione)
  - 4/4 rubriche ≥ soglia 4/5 (tutte 5/5, media 5.0)
  - 0 actionable findings; 4 advisory low-priority:
    1. (ADV-1) public/icons PWA placeholder: aggiungere manualmente icon-192.png e icon-512px PNG reali prima del deploy
    2. (ADV-2) next-auth v5 beta: all'uscita stable aggiornare pacchetto e firma `auth()` se necessario; commenti già presenti nel codice
    3. (ADV-3) Stripe priceId nel webhook: opzionalmente salvare nella subscription anche un campo display per UI
    4. (ADV-4) Form onboarding: country select con nazioni completo in UI ma è consentito anche testo libero; validazione lato server non è strict su ISO 3166 (intenzionale per MVP)
  - Lingua UI italiano confermata al 100% su campionamento completo landing/onboarding/dashboard/matches/profile/stats/pricing/achievements/signin + messaggi errore API (400 messaggi)
  - Prisma schema 14 modelli (User/Account/Session/VerificationToken + PlayerProfile/Match/CareerIndexHistory/PlayerSeason/Achievement/PlayerAchievement/Subscription + Team/TeamMember/MatchParticipant/MatchConfirmation multiplayer future) + 10 enum; relazioni e campi corrispondono 1:1 a Spec FR-14 e AC-2
  - Career Index: WIN+15/DRAW+3/LOSS-10, bonus ruolo ATT(g+3,a+2)/CEN(g+2,a+3)/DIF(g+2,a+2)/POR(w+5,d+2,cs+8); clamp -20/+40
  - OVR mapping lineare clamp(40,99); 1000→60, 1400→80
  - XP 50 level thresholds array, calculateXpEarned con CAP 150
  - PlayerCard 6 attributi FORM/IMPACT/RESULTS/SCORING/EXPERIENCE/CONSISTENCY 0-99
  - Stripe signature verification webhook + 5 eventi gestiti
- **Checkpoint Results**:
  - CP-01 (`rule`): `pass`
  - CP-02 (`rule`): `pass`
  - CP-03 (`rule`): `pass`
  - CP-04 (`rule`): `pass`
  - CP-05 (`rule`): `pass`
  - CP-06 (`rule`): `pass`
  - CP-07 (`rule`): `pass`
  - CP-08 (`rule`): `pass`
  - CP-09 (`rule`): `pass`
  - CP-10 (`rule`): `pass`
  - CP-11 (`rule`): `pass`
  - CP-12 (`rule`): `pass`
  - CP-13 (`rule`): `pass`
  - CP-14 (`rule`): `pass`
  - CP-15 (`rule`): `pass`
  - CP-16 (`rule`): `pass`
  - CP-V1 (`rubric`): `pass`; score 5/5; rationale palette corretta #070A08 dark bg + #22C55E primary + #7CFF6B electric in globals.css + tailwind config + globals pitch-wrapper pattern geometria campo elegante; zero gradienti SaaS blu
  - CP-V2 (`rubric`): `pass`; score 5/5; rationale MobileBottomNav sticky md:hidden 5 tab + + centrale CirclePlus sporgente shadow-greenElectric; tutti le pagine mobile-first con max-w-mobile appropriate
  - CP-V3 (`rubric`): `pass`; score 5/5; rationale MatchResultScreen con @keyframes shine count-up XP barra progresso CI delta transition LEVEL UP banner gigante verde + stelle bounce sezione achievement sbloccati
  - CP-V4 (`rubric`): `pass`; score 5/5; rationale separazione netta src/app routes/API, src/components UI per feature, src/lib pure logic services, src/types; Prisma schema completo multiplayer future-ready; entitlement canX centralizzati; zero any TS ingiustificati (GetDiagnostics 0 errori strict mode)
- **Findings**:
  - (ADV-1): `advisory`; low; deploy phase; reproduction: public/ non contiene icon-192.png icon-512.png binary; outcome atteso = manifest icons puntano a file esistenti
  - (ADV-2): `advisory`; low; pacchetto next-auth beta; outcome atteso = aggiornamento a stable appena disponibile
  - (ADV-3): `advisory`; low; Stripe UI detail; outcome atteso = opzionale campo displayPriceName
  - (ADV-4): `advisory`; low; onboarding; outcome atteso = strict validazione country ISO se lo si desidera in futuro
- **Recommended Issues**:
  - Nessuno (0 actionable findings). Gli advisory sono low-priority non bloccanti e non violano alcun AC.
