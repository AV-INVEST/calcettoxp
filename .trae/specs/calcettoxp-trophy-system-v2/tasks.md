# CalcettoXP — Trophy System V2 — Implementation Plan

## Task 1: Prisma Schema additive changes + Migration SAFE
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Aggiungere a `PlayerProfile`: `referralCode String @unique` (generato a onboarding)
  - Nuovo modello `Referral`: id, referrerId (PlayerProfile), referredId (PlayerProfile UNIQUE), createdAt, status (PENDING/CONFIRMED). FK referrerId→PlayerProfile.id ON DELETE CASCADE, referredId→PlayerProfile.id ON DELETE CASCADE.
  - Nuovo modello `ShareRecord`: id, playerProfileId, createdAt (Date), dayKey (String 'YYYY-MM-DD'), source ('WEBSHARE'|'COPY'). @@unique([playerProfileId, dayKey]) con shareCount Int default=0.
  - Migration SQL ADDITIVE. Nessun DROP.
  - Seed/backfill referralCode per profili esistenti (generator deterministico safe).
- **Acceptance Criteria Addressed**: AC-1 (precondizione DB), AC-6 (Referral model), AC-7 (ShareRecord), AC-15
- **Test Requirements**:
  - `rule` TR-1.1: Prisma generate non errore, migration.sql contiene solo ADD COLUMN e CREATE TABLE. Evidence: `npx prisma generate` exit 0 + migration.sql content.
  - `rule` TR-1.2: Referral.referredId unique constraint effettivo; ShareRecord (playerId,dayKey) unique effettivo. Evidence: schema.prisma @@unique e @@id.
- **Notes**: Nessun push/force. Solo migration file e generate.

## Task 2: Achievement Catalog (Source of Truth) + Sync Helper
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Creare `src/lib/achievement-catalog.ts`:
    - Tipi: `AchievementCatalogEntry` { key, name, description, tier: 'FREE'|'PRO', category: string, order: number, requirement: { kind, target, rolePath? }, icon: LucideIconName, legacyKey? }
    - Costante `ACHIEVEMENT_CATALOG: AchievementCatalogEntry[]` con ESATTAMENTE 50 entries (20 FREE, 30 PRO) come da specifica.
    - 10 categorie: 'inizio_carriera', 'social_community', 'partite', 'vittorie', 'serie', 'career_index', 'livello_xp', 'specialista', 'stagioni', 'prestige_pro'.
    - Key: stable snake_case uppercase es. `PRIMO_PASSO`, `SPECIALISTA_I`, `LEGGE_NDA_VIVENTE`.
    - Per Specialista I..IV + Maestro: requirement.kind='ROLE_AGGREGATE' con rolePath multipli.
  - Creare `src/lib/achievement-sync.ts` helper:
    - `ensureAchievementsSynced(prisma)`: idempotente. Per ogni catalog entry, upsert `Achievement` by key (name/description/tier updated). NON cancella obsoleti. Ritorna report.
    - **Non chiama DB durante il render delle RSC.** Chiama solo via script o API dedicate.
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `rule` TR-2.1: catalog.length===50, free===20, pro===30. Evidence: node REPL o test import e count.
  - `rule` TR-2.2: sync helper idempotente (2 run → stessa cardinality Achievement). Evidence: run 2x + count DB.

## Task 3: Achievement Engine (evaluator) + Lifetime/Role/Streak aggregators
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Creare `src/lib/achievement-engine.ts`:
    - `computeLifetimeAggregates(profile, matches)`: { matches, wins, draws, losses, goals, assists, cleanSheetsPOR, xp, level, ci, shareCount_validDays, referralConfirmed_count, distinctSeasonKeys, roleSpecific: { ATT:{goals}, CEN:{assists}, DIF:{matches_le1_against}, POR:{cleanSheets} } }
    - `computeStreaks(matchesSortedAsc)`: { longestUnbeaten, longestWinStreak, currentUnbeaten, currentWinStreak } — sorted by playedAt ascending.
    - `evaluateAchievementProgress(playerProfileId, catalog, aggregates, streaks, opts:{isPro:boolean, today:Date})`:
      - Per ogni entry catalog → { key, current, target, unlocked: boolean, completedButLocked: boolean }
      - Streak trophies: usano LUNGEST streak (non current).
      - Unlocked FREE: current>=target & tier==FREE.
      - Unlocked PRO: current>=target & tier==PRO & isPro.
      - CompletedButLocked PRO: current>=target & tier==PRO & !isPro.
    - `persistUnlocks(tx, playerProfileId, evaluations, unlockedAt)`: transaction-safe upsert PlayerAchievement. Scrive unlockedAt SOLO se unlocked true; altrimenti aggiorna progress/progressTarget.
  - Refactor `checkAchievementsAfterMatch` esistente in `src/lib/achievements.ts` per usare l'engine; mantenere firma compatibile per non rompere `src/app/api/matches/route.ts` e `[id]/route.ts`.
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5, AC-10
- **Test Requirements**:
  - `rule` TR-3.1: Specialista I unlocked quando ATT.goals>=10 (o CEN/DIF/POR). Evidence: mock aggregates + evaluate → Specialista_I unlocked=true.
  - `rule` TR-3.2: PRO unlocked solo se isPro=true; completedButLocked se isPro=false e current>=target. Evidence: unit evaluate.
  - `rule` TR-3.3: ON_FIRE key esclusa da evaluations se non nel catalog; existing PlayerAchievement legacy non letto nella collection V2. Evidence: catalog keys list.

## Task 4: Share Tracking API + ShareCardButton upgrade
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1, Task 3
- **Description**:
  - Creare `src/app/api/share/track/route.ts` POST.
    - Auth check.
    - Valida source ('WEBSHARE'|'COPY').
    - dayKey = 'YYYY-MM-DD' locale (o UTC, coerente).
    - Upsert ShareRecord: se non esiste crea count=1; se esiste count rimane 1 (max 1/day). Anti farming.
    - Dopo share, trigger `evaluateAchievementProgress` per i soli trofei social (MOSTRA_LA_CARD, PASSAPAROLA, AMBASCIATORE). Persisti unlock.
    - Return { ok, counted: boolean (true se nuovo share utile) }.
  - Aggiornare `ShareCardButton.tsx` ('use client'):
    - Dopo Web Share completato (non AbortError) → fetch POST `/api/share/track` body {source:'WEBSHARE'}.
    - Dopo Copy completato → fetch POST {source:'COPY'}.
    - Loading state e toast minimo (Copiato! rimane; share aggiunge "Condivisione registrata").
    - Rimuovi riferimenti a "WhatsApp" o canali specifici nel copy visibile (se presenti).
  - Link condiviso = `/p/<username>?ref=<referralCode>`. Build URL con ref.
- **Acceptance Criteria Addressed**: AC-7, FR-7
- **Test Requirements**:
  - `rule` TR-4.1: 2 share stesso giorno → ShareRecord count rimane 1; counted=true poi false. Evidence: 2x POST + DB.
  - `rule` TR-4.2: Share tracciato → achievement MOSTRA_LA_CARD progress=1 (se FREE). Evidence: PlayerAchievement progress.

## Task 5: Referral system (persist ref through signup → onboarding → unlock)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1, Task 3
- **Description**:
  - **A.** Pagina pubblica `/p/[username]/page.tsx`:
    - Nel RSC, se `searchParams.ref` presente e valido → setta cookie `cxp_ref=<code>` max-age=30g, HttpOnly? No HttpOnly se serve al client dopo signup. Usa cookie NEXT.js (cookies() set).
    - CTA "CREA LA TUA PLAYER CARD GRATIS" prominente → href `/signin` o `/onboarding` secondo stato.
  - **B.** Onboarding route `/api/onboarding/route.ts`:
    - Dopo creazione PlayerProfile (già in transaction), cerca cookie `cxp_ref`. Se presente:
      - Trova referrerProfile by referralCode = cookie.
      - Se esiste E referrer.id !== nuovo playerProfile.id E referredId non già usato altrove:
        - Crea Referral (referrerId, referredId, status=CONFIRMED) — unico per referredId.
      - Pulisci cookie.
    - Trigger evaluation achievement PRIMO_COMPAGNO (1), SPOGLIATOIO (3), COMMUNITY_BUILDER (5), CAPITANO (10), TALENT_SCOUT (25) per il referrer. Persisti unlock.
  - **C.** `PlayerProfile.referralCode` default generation:
    - Aggiungere a onboarding POST: generazione codice 6-8 chars ALFANUMERICO maiuscolo unico.
    - Backfill helper: per profili esistenti senza codice (migration post).
- **Acceptance Criteria Addressed**: AC-6, FR-8
- **Test Requirements**:
  - `rule` TR-5.1: Self-referral (refCode proprio) → rifiutato. Evidence: Referral non creato.
  - `rule` TR-5.2: Stesso referredId usato due volte → secondo fallisce. Evidence: unique constraint.
  - `rule` TR-5.3: 1 referral valido → referrer unlock FREE#6. Evidence: PlayerAchievement.

## Task 6: Match IMMUTABILITY (UI + API) + Date Picker 72h UI
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None (parallelo)
- **Description**:
  - **A. API PATCH `/api/matches/[id]/route.ts`**:
    - Lascia endpoint esistente (per rompere meno cose) ma **blocca SEMPRE** PATCH: early return 403 `{ok:false,error:"Partite non modificabili"}`. Prima di qualsiasi altra operazione.
    - GET rimane invariato.
  - **B. UI Dettaglio partita `/matches/[id]/page.tsx`**:
    - Rimuovi sezione "Stato partita" che mostra "Modifica disponibile per altri N minuti" (card con Pencil).
    - Rimuovi `<MatchEditForm />` e import.
    - Rimuovi `Pencil` import.
    - Stato partita: sempre card "Partita registrata · Non modificabile" con Lock icon (verde/grigio, non pulsante).
  - **C. UI Lista partite `/matches/page.tsx`**:
    - Cercare e rimuovere matita/edit Pencil, link edit se presenti.
  - **D. RegisterMatchForm date picker**:
    - In `RegisterMatchForm.tsx`: calcola `minDate` = now-72h tz browser e `maxDate` = now tz browser.
    - `<input type="datetime-local">` attributes min + max in ISO locale format (no Z).
    - onSubmit client: extra check che playedAt sia entro [min,max].
- **Acceptance Criteria Addressed**: AC-8, AC-9
- **Test Requirements**:
  - `rule` TR-6.1: PATCH /api/matches/{id} → status 403 sempre. Evidence: fetch/curl response.
  - `rule` TR-6.2: Nessun Pencil/Edit button in DOM pagine partite. Evidence: grep rendered HTML o screenshot.
  - `rule` TR-6.3: Input date min=now-72h max=now. Evidence: DevTools attributes.

## Task 7: PRO reconciliation on Stripe subscription active (webhook)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 2, Task 3
- **Description**:
  - In `src/app/api/webhook/stripe/route.ts`, dopo `upsertSubscriptionFromStripeSub` o dopo evento `checkout.session.completed` / `customer.subscription.updated` → se status passa ad ACTIVE/TRIALING:
    - Trova userId, carica playerProfile.id.
    - Valuta tutti i 50 achievement via `evaluateAchievementProgress(..., {isPro:true})`.
    - `persistUnlocks(tx, playerId, evaluations, unlockedAt=now)` per quelli tier==PRO && completedButLocked → ora diventa unlocked (aggiorna unlockedAt solo se prima era null e target raggiunto).
  - SAFE: non duplica unlock; upsert per chiave.
- **Acceptance Criteria Addressed**: AC-5 (seconda parte: unlock retroattivo)
- **Test Requirements**:
  - `rule` TR-7.1: Utente FREE con PRO 100pt completato ma locked, dopo callback status=ACTIVE → unlockedAt popolato per CENTENARIO. Evidence: DB PlayerAchievement.

## Task 8: Trophy Page Redesign WOW `/achievements`
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - Riscrittura COMPLETA `src/app/achievements/page.tsx`.
  - Rename metadata title: "Trofei | CalcettoXP". Description aggiornata.
  - Metriche calcolate da catalog: `totalInCatalog=50`, `freeTotal=20`, `proTotal=30`.
  - Hero section:
    - Titolo "TROFEI" uppercase bold huge. `X / 50 sbloccati`.
    - Circular progress SVG ring con gradiente verde→oro. `COMPLETAMENTO CARRIERA XX%`.
    - Sotto: FREE counter verde + PRO counter gold.
  - "ULTIMO SBLOCCATO" (se esiste): card orizzontale con data, glow appropriato.
  - "PROSSIMO TROFEO": tra i non sbloccati, ordina per `(target-current)/target` crescente → più vicino. Mostra icona/nome/progresso/"Te ne mancano N".
  - 10 Categorie sezioni. Per ogni categoria:
    - Intestazione con TITOLO uppercase, X/Y sbloccati, mini-progress orizzontale.
    - Trophy Cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.
  - Card design (stile, nessuna dipendenza da librerie extra):
    - FREE unlocked: graphite, bordo verde neon 1px, soft green glow, icona verde, check piccolo, shimmer keyframes slow.
    - FREE locked: dark matte, piccolo lock grigio, progress thin bar, nome visibile, requisito.
    - PRO unlocked: obsidian bg, gold champagne border (amber-400/40), gold glow, crown tiny, badge PRO GOLD.
    - PRO locked: dark + lock gold, status "COMPLETATO · DISPONIBILE CON PRO" se già raggiunto.
  - `prefers-reduced-motion`: disattiva shimmer/glow animati.
  - Mobile: 1 card per riga, nomi 2 righe, NO truncate.
  - Footer link "Torna alla dashboard".
- **Acceptance Criteria Addressed**: AC-2, AC-11, AC-13, AC-16
- **Test Requirements**:
  - `rule` TR-8.1: Nuovo account → 0/50, FREE 0/20, PRO 0/30. Evidence: screenshot.
  - `rule` TR-8.2: Mobile 390px → `scrollWidth === clientWidth`. Evidence: browser check.
  - `rubric` TR-8.3: Qualità visuale; scala 1-5; anchors 1/3/5 come AC-16; threshold >=4; evidence screenshot.

## Task 9: Profile — Storico Stagioni Premium + Rename Trofei
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 8 (stile consistency)
- **Description**:
  - File `src/app/profile/page.tsx`:
    - Rinominare intestazione card "Achievement sbloccati" → "Trofei sbloccati".
    - Link "Vedi tutti" → href /achievements invariato.
    - **Storico Stagioni FREE**:
      - Rimuovere badge "LOCKED" rosso/grigio.
      - Stile container: obsidian black bg-gradient-to-br da amber-500/[0.03] via nero a trasparente, border amber-400/20, lock icon gold crown badge PRO GOLD.
      - Anteprima: 1 stagione REALE visibile (FREE base); altre N-1 righe "•••" blur + lock eleganti.
      - CTA "Sblocca PRO per vedere N stagioni" con stile gold CTA (come pricing).
    - **Storico Stagioni PRO**: stesso stile ma senza lock, dati reali.
  - Verifica wrap OVR/CI/LV: NESSUN box esterno visibile (solo grid/flex/gap).
- **Acceptance Criteria Addressed**: AC-11, AC-12 (in parte), AC-13
- **Test Requirements**:
  - `rule` TR-9.1: FREE user storico stagioni NO "LOCKED" testo rosso; badge PRO gold + crown. Evidence: screenshot.
  - `rule` TR-9.2: "Trofei sbloccati" label presente, "Achievement" assente nel profilo. Evidence: grep rendered text.

## Task 10: Stats — Coerenza PRO premium locked
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 9
- **Description**:
  - File `src/app/stats/page.tsx`:
    - Blocco FREE PRO upsell (attuale) mantenuto.
    - **Sezione Stagione corrente**: se FREE e currentSeason esiste → mostrare ma con badge/stile locked premium uniforme con profilo; badge "ATTIVA" NON mostrata per FREE (mostra "Stagione in corso · Prossimamente sbloccabile con PRO" o simile).
    - Blocchi FREE limited CI chart (ultimi 20): lasciare invariato ma badge "FREE · Ultimi 20 punti" non "LOCKED" rosso.
    - Badge FREE/Card advanced: stile obsidian/gold locked coerente con Profilo V2.
- **Acceptance Criteria Addressed**: AC-12
- **Test Requirements**:
  - `rule` TR-10.1: FREE user Stats → nessun "ATTIVA" verde sullo stagionale se bloccato/limitato. Evidence: screenshot.
  - `rule` TR-10.2: Stile locked uniforme con profilo (gold border/crown). Evidence: confronto screenshot.

## Task 11: Dashboard Layout fixes (double box / centering) + Rename label
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None (parallelo tranne label rename)
- **Description**:
  - Leggere dashboard completo e:
    - Verificare OVR/CI/LV (se presenti nel dashboard) o Streak/Settimana/Stagione/MigliorCI: 2x2, stessa altezza, flex-col items-center justify-center text-center.
    - Partite/Vittorie/Gol/Assist: idem.
    - Rimuovere wrapper superflui con border/background che avvolgono card multiple.
    - Trovare e rinominare ogni "Achievement" in "Trofei" nel testo visibile del dashboard (es. NextAchievementProgress).
  - Aggiornare `src/components/dashboard/NextAchievementProgress.tsx` se esiste e usa label "Achievement".
- **Acceptance Criteria Addressed**: AC-13, AC-14
- **Test Requirements**:
  - `rule` TR-11.1: Nessun `overflow-x: hidden` su html/body/root in globals.css/layout. Evidence: grep output.
  - `rubric` TR-11.2: Layout dashboard/free di doppio-box; scala 1-5; anchors 1=tanti wrapper box; 3=alcuni; 5=solo grid/flex/gap per layout; threshold≥4. Evidence: screenshot + DOM isp.

## Task 12: Rename UI "Achievement" → "Trofei" (tutti i file) + MobileBottomNav links
- **Status**: `pending`
- **Priority**: low
- **Depends On**: None (parallelo)
- **Description**:
  - Grep tutti i file per "Achievement" nel testo visibile (UI italiano):
    - Title metadata, CardTitle, Badge, placeholder, toast, MatchResultScreen.
  - Sostituire con "Trofei" / "Trofeo" / "Trofei sbloccati" / "Nuovo trofeo".
  - NON toccare: model Prisma (Achievement), import `Achievement`, chiavi TS.
  - Check MobileBottomNav: label "Trofei" invece di "Achievement".
- **Acceptance Criteria Addressed**: AC-2 (testo UI), FR-9
- **Test Requirements**:
  - `rule` TR-12.1: Grep "Achievement" in stringhe UI (non in type/import/model) → zero occorrenze. Evidence: `Grep pattern="[\"'].*Achievement"` nei .tsx.

## Task 13: Match Post-result Screen — New trofei green/gold consistent
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 3
- **Description**:
  - `src/components/matches/MatchResultScreen.tsx` (esiste):
    - Se nuovo trofeo FREE: glow verde.
    - Se nuovo trofeo PRO (e utente PRO): glow gold/champagne.
    - Se nuovo trofeo PRO completedButLocked NON ancora unlocked: NON mostrare in nuovi sbloccati (non è ancora unlocked).
  - Verifica coerenza con Task 3 persist unlocks.
- **Acceptance Criteria Addressed**: AC-5, AC-16
- **Test Requirements**:
  - `rule` TR-13.1: Response match post unlocks array contiene solo achievement con unlockedAt≠null (PRO richiede isPro). Evidence: response body API.

## Task 14: Final typecheck + next build + Report breve
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Tasks 1–13 completati
- **Description**:
  - `npx tsc --noEmit` → fix errori.
  - `npx next build` → distinguere errore env DATABASE_URL da errore Next.
  - Scrivere report BREVE (in file `REPORT_TROFEI_V2.txt` WORKDIR o restituito in chiusura):
    1. Lista file modificati
    2. Migration/schema additive (nome migration, modelli, unique)
    3. Fix 0/0 — come è stato risolto (catalogo canonicale 50)
    4. Conferma 20 FREE / 30 PRO — conteggio dal catalog
    5. Share+Referral — modelli, anti-farming, self-referral block
    6. Specialisti ruolo — 4 ruoli + backend unlock OR-path
    7. Legacy — ON_FIRE escluso da V2, dati mantenuti
    8. Profilo/Stats premium — stile locked gold coerente
    9. Match immutabile + date 72h UI/API
    10. Test realmente eseguiti (tsc, next build, responsive check se fatto)
- **Acceptance Criteria Addressed**: AC-15, tutti gli altri (verifica finale)
- **Test Requirements**:
  - `rule` TR-14.1: `tsc --noEmit` exit 0. Evidence: stdout.
  - `rule` TR-14.2: `next build` exit 0 (o solo env errori). Evidence: stdout.
  - `rule` TR-14.3: Report presente e completo 1-10. Evidence: file content o response text.

---

### Note sulla sequenza di esecuzione
- Start: Tasks 1, 6, 11, 12 possono partire in parallelo (non condividono write sugli stessi file)
- Dopo Task 1 → Task 2 e 4,5
- Dopo Task 2 → Task 3, 7, 8
- Dopo Task 8 → Task 9 → Task 10
- Fine: Task 13, 14
