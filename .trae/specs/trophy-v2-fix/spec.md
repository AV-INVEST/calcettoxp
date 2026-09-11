# CalcettoXP - Trophy V2 Fix & UI Polish - Product Requirements Document

## Overview
- **Summary**: Correzione di bug reali nel Trophy System V2, audit coerenza FREE/PRO, rimozione CTA ridondanti, sistemazione layout mobile critici e miglioramento dell'allineamento generale delle cards.
- **Purpose**: Risolvere le incongruenze dati/UI che abbassano qualità percepita e trust, mantenendo intatte formule core e identità grafica.
- **Target Users**: Utenti FREE e PRO di CalcettoXP (mobile-first: 390px / 430px, poi desktop).

## Goals
1. Risolvere il bug del conteggio stagioni (source of truth: `DISTINCT Match.seasonKey`).
2. Risolvere il bug "Primo Passo 100% ma locked" implementando una funzione di riconciliazione idempotente.
3. Audit completo dei 50 achievement: tutte le metriche devono essere calcolate da source of truth corretti.
4. Rendere coerente FREE vs PRO tra Dashboard, /profile, /stats (nessuna metrica PRO gratuita in un punto e locked in un altro).
5. Rimuovere CTA PRO duplicate: massimo 1 CTA forte per pagina.
6. Sistemare layout mobile (390px / 430px) in dashboard ultime partite, matches list, match detail, cards sovrapposte/testo compresso.
7. Rimuovere lucchetto superfluo dalle cards della lista partite.
8. Migliorare allineamento generale cards (padding uniforme, gap, vertical centering).

## Non-Goals
- **NON** cambiare formule XP, Career Index, OVR mapping, role contribution CI.
- **NON** cambiare auth, Stripe, prezzi, season dates, logiche core.
- **NON** rifare l'estetica della bacheca trofei o delle cards da zero.
- **NON** riabilitare modifica partite (immutabilità confermata).
- **NON** fare refactor inutili o modifiche a schemi non necessari.
- **NON** fare push/deploy.
- **NON** eseguire `prisma migrate reset`, drop, truncate, delete massivi.

## Background & Context
Dall'analisi READ-ONLY del codice sono emerse le seguenti cause radice:

### Causa Bug Stagioni (2/2 con 1 sola partita)
In [achievement-engine.ts:138-144](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/achievement-engine.ts#L138-L144) il campo `distinctSeasonsPlayed` viene calcolato con:
```
prisma.playerSeason.findMany(...).distinct("seasonKey")
```
Ma `PlayerSeason` viene creato automaticamente all'onboarding ([route.ts:126-139](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/api/onboarding/route.ts#L126-L139)) con `matches: 0` e nessuna garanzia che contenga almeno un Match. Inoltre potrebbero esistere record PlayerSeason creati per stagioni che non hanno Match reali.

**Source of Truth corretto**: `COUNT(DISTINCT Match.seasonKey) WHERE Match.playerId = profileId`.

### Causa Bug Primo Passo (100% ma locked)
La UI della pagina achievements mostra `progress.percentage === 1` calcolato correttamente da `evaluateAchievementProgress`. Tuttavia il badge unlocked e il conteggio FREE 0/20 dipendono da `playerAchievement.unlockedAt`. Se non è mai stato eseguito `persistUnlocksForProfile` (es: utenti pre V2, o errore sporadico nella route match), il record `PlayerAchievement` non viene creato → `isUnlocked = false` nonostante `requirementMet = true`.

**Soluzione**: funzione `reconcileAchievementsForProfile(profileId)` idempotente che calcola 50 trophy da source of truth, crea solo gli unlock mancanti validi, è rilanciabile senza side effect, e NON viene chiamata durante il rendering.

### CTA Duplicate
- `/stats`: card "Stagione corrente locked" (~riga 413) + card principale "Passa a PRO per statistiche avanzate" (~riga 468) → 2 CTA consecutive.
- `/profile`: CTA mini "Sblocca" dentro stagione bloccata (~riga 638) + card enorme "Storico completo" subito dopo (~riga 664) → 2 CTA sullo stesso tema.

## Functional Requirements

### FR-1: Trophy Engine - Source of Truth Stagioni
- `buildAggregatorContext.seasons.distinctSeasonsPlayed` deve essere calcolato esclusivamente da `Match.seasonKey` distinte con Match reali del player.
- Non deve contare PlayerSeason vuote, stagione corrente solo perché esiste, createdAt profilo.

### FR-2: Trophy Engine - Audit 50 Achievement
Verifica e correzione di tutte le 12 famiglie di requirement:
- LIFETIME_MATCHES, LIFETIME_WINS, LIFETIME_LEVEL, LIFETIME_CI, LIFETIME_XP
- STREAK_UNBEATEN, STREAK_WIN
- SHARE_VALID_DAYS, REFERRAL_CONFIRMED
- SEASONS_DISTINCT (corretto da Match)
- FIRST_CONTRIBUTION
- ROLE_AGGREGATE (ATT→gol, CEN→assist, DIF→partite ≤1 subito, POR→clean sheets, logica OR)

Nessun requisito numerico dei 50 trophy viene modificato. Catalogo rimane 20 FREE / 30 PRO / 50 totali.

### FR-3: reconcileAchievementsForProfile
- Firma: `async reconcileAchievementsForProfile(profileId, opts?: { dryRun?: boolean, ctx?: AggregatorContext })`
- Idempotente: più chiamate non duplicano record.
- Calcola tutti i 50 trophy dal source of truth.
- Per ogni achievement FREE con `requirementMet` e senza `PlayerAchievement` esistente: UPSERT/CREATE `unlockedAt: now`.
- Per ogni achievement PRO con `requirementMet` + utente PRO + senza record: crea unlock.
- Per achievement PRO FREE user met requirement: NON crea unlock ma traccia in `completedButLocked`.
- Se trova `PlayerAchievement` già sbloccato ma matematicamente NON valido: **NON cancella**, flagga in report.
- Dry-run restituisce il report di cosa cambierebbe.
- NON modifica XP/CI/OVR.
- Da richiamare nei punti: dopo POST match, dopo share valido, dopo referral confermato, dopo upgrade PRO.

### FR-4: Coerenza FREE/PRO Gating
Matrice di gating uniforme:
| Metrica / Sezione | FREE | PRO |
|---|---|---|
| OVR attuale, CI attuale, LV/XP | ✅ | ✅ |
| Statistiche base lifetime (partite/V/P/S/gol/assist/clean sheets) | ✅ | ✅ |
| Ultime partite (lista) | ✅ | ✅ |
| Match stagione corrente | ✅ | ✅ |
| Career Index Chart storico limitato (20pt) | ✅ | — |
| Career Index Chart completo | ❌ | ✅ |
| Win Rate lifetime | ✅ | ✅ |
| Analytics 7/30/90 giorni | ❌ | ✅ |
| Statistiche per ruolo | ❌ | ✅ |
| Record avanzati / streak avanzati | ❌ | ✅ |
| Storico completo stagioni (>1) | ❌ | ✅ |
| Confronto tra stagioni | ❌ | ✅ |
| Trend storico completo CI | ❌ | ✅ |
| Tema card premium | ❌ | ✅ |

Audit Dashboard/Profile/Stats: ogni metrica applica la stessa regola in tutte le pagine.

### FR-5: CTA Duplicate Rimosse
- `/stats`: Rimuovere la prima card "Stagione corrente locked" ~riga 413. Mantenere solo la card "Passa a PRO per statistiche avanzate" ~riga 468.
- `/profile`: Consolidare i 2 blocchi PRO "Storico stagioni" in UN SOLO blocco: anteprima lock elegante + singola CTA. Rimuovere CTA inline dentro la stagione bloccata.
- `/dashboard`: Nessuna CTA aggiuntiva se già esiste il blocco "Vantaggi esclusivi" (verificare solo che non sia duplicata).

### FR-6: Mobile UX - Ultime Partite (Dashboard)
Su mobile card "Ultime partite" ridisegnata in layout a 2 righe minimo:
```
ROW 1: [WIN badge]   [7 - 4 punteggio]   [+22 CI badge]
ROW 2: [data dd/MM]  [RUOLO]  [Gol X]  [Assist Y]
```
Nessuna label sovrapposta. Icone e numeri devono respirare (padding uniforme, gap espliciti).

### FR-7: Match List Card - Rimuovi Lucchetto
Rimuovere solo l'icona piccolo lucchetto in basso a destra dalla card della partita nella lista `/matches`. Il backend resta immutabile (immutabilità). Il concept "non modificabile" rimane nel dettaglio partita.

### FR-8: Match Detail - Progressi Partita
Su <=430px la sezione "Progressi partita" non usa 3 colonne troppo strette. Layout:
```
RIGA 1 (2-col):  XP Guadagnati   |  Career Index
RIGA 2 (full):   CI  1000  →  1022
```
Nessun testo spezzato "CI Before → After" su righe multiple.

### FR-9: Allineamento Generale Cards
Audit delle cards in: Dashboard, Matches list, Match detail, Profile, Stats, Trophies.
Correggere: padding interno uniforme, stesso radius, gap logici, vertical alignment ottico centrato, icon container fixed-size + shrink-0, valori importanti no-wrap, testo con min-w-0, cards in griglia stessa min-height.

## Non-Functional Requirements
- **NFR-1 (Typecheck)**: `npx tsc --noEmit` deve passare senza errori.
- **NFR-2 (Build)**: `next build` deve completare senza errori.
- **NFR-3 (Idempotenza)**: La riconciliazione è safe e non distruttiva.
- **NFR-4 (Mobile-first)**: Verifica layout a 390px e 430px.

## Constraints
- **Technical DB**: Nessun `prisma migrate reset`, drop, truncate, delete massivi. Solo UPSERT/CREATE di achievement mancanti e, se strettamente necessario, UPDATE `PlayerAchievement` singoli con approvazione.
- **Technical DB 2**: `DATABASE_URL` attuale è Neon reale. Prima di qualsiasi WRITE: diagnosi READ-ONLY + dry-run.
- **Business**: Stripe test solo in modalità TEST/SANDBOX se toccato. Nessun uso sk_live_.
- **Business 2**: Catalogo 50 trofei: 20 FREE, 30 PRO (non cambiare numeri o requisiti).
- **Dependencies**: Prisma, Next.js 15, lucide-react esistenti.

## Assumptions
- Gli utenti esistenti con 1 sola Match reale avranno distinct seasons = 1 dopo la correzione.
- Nessun PlayerAchievement "falsamente sbloccato" viene cancellato in automatico, ma solo segnalato.
- Il gating CI chart a 20 punti FREE è già presente nella dashboard (line 137) e nello stats (riga 106) — è coerente, va mantenuto.

## Acceptance Criteria

### AC-1: Trophy Integrity - 1 sola partita
- **Type**: `rule`
- **Given**: Un profilo con esattamente 1 Match registrato
- **When**: Viene costruito l'AggregatorContext e valutati i 50 trophy
- **Then**: 
  - distinctSeasonsPlayed = 1
  - "Secondo Capitolo" progresso = 1/2 (non 2/2)
  - "Veterano delle Stagioni" progresso = 1/3
  - "Una Vita sul Campo" progresso = 1/5
  - "Primo Passo" requirementMet = true
  - Dopo reconcileAchievementsForProfile: Primo Passo.isUnlocked = true, unlockedAt valorizzato
- **Pass Condition**: Tutte le asserzioni sopra vere
- **Evidence**: Confronto DB READ-ONLY (Profile.matchesPlayed vs COUNT(Match) vs DISTINCT Match.seasonKey vs PlayerAchievement.unlockedAt per chiave PRIMO_PASSO) + test unità con fixture minima.

### AC-2: Trophy Reconciliation Idempotente
- **Type**: `rule`
- **Given**: 2 chiamate consecutive a `reconcileAchievementsForProfile(profileId)`
- **When**: Entrambe completano
- **Then**: Nessun errore, conteggio unlocked identico, nessun duplicato PlayerAchievement
- **Pass Condition**: COUNT(PlayerAchievement WHERE unlockedAt IS NOT NULL) identico prima e dopo seconda chiamata
- **Evidence**: Query COUNT prima/dopo + dry-run report.

### AC-3: Audit 50 Achievement - Tutte le Famiglie
- **Type**: `rule`
- **Given**: Una fixture con Match, shares, referrals, CI/LV noti
- **When**: Vengono calcolati tutti i 50 achievement
- **Then**: Ogni famiglia produce valori attesi (match lifetime = COUNT(Match), vittorie = WHERE result='WIN', streak calcolati correttamente, shares validi = DISTINCT dayKey ShareRecord, referrals = status CONFIRMED, stagioni da Match.seasonKey, specialista con metriche corrette per ruolo)
- **Pass Condition**: Per ogni RequirementKind, il valore calcolato = il valore atteso dalla fixture
- **Evidence**: Test deterministici per LIFETIME_MATCHES, LIFETIME_WINS, STREAK_UNBEATEN 5, SEASONS_DISTINCT, ROLE_AGGREGATE ATT e POR.

### AC-4: Coerenza FREE/PRO
- **Type**: `rule`
- **Given**: Utente FREE che visita Dashboard → /profile → /stats
- **When**: Confronta la presenza/assenza di analytics premium
- **Then**: Nessuna sezione mostra "Analisi 7/30/90g" o "Storico completo >1 stagione" in una pagina e lo nega in un'altra. Gating CI chart uniforme (20pt FREE)
- **Pass Condition**: Check manuale + grep per analytics 7/30/90 e storico completo: tutti gated correttamente in tutte le 3 pagine
- **Evidence**: Screenshot o markup snapshot dei 3 punti + revisione codice.

### AC-5: CTA Uniche per Pagina
- **Type**: `rule`
- **Given**: Pagine /stats e /profile in stato FREE
- **When**: Conto i blocchi CTA PRO
- **Then**: In /stats 1 sola CTA forte; in /profile 1 solo blocco PRO relativo allo storico
- **Pass Condition**: Conteggio CTA = 1 per tema per pagina
- **Evidence**: Grep dei testi "Passa a PRO", "Sblocca PRO", "Storico completo" e conteggio per pagina.

### AC-6: Mobile UX - Ultime Partite (390/430px)
- **Type**: `rubric`
- **Dimension**: Layout leggibilità card "Ultime partite"
- **Scale**: 1-5
- **Anchors**: 1 = label sovrapposte, testo compattato "RUOLO GOL ASS..."; 3 = leggibile ma piccolo; 5 = 2 righe separate, padding uniforme, nessun overlap, tutti i dati visibili senza truncate aggressivo
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot 390px e 430px + ispezione padding/gap.

### AC-7: Mobile UX - Match Detail Progressi (390/430px)
- **Type**: `rubric`
- **Dimension**: Layout sezione "Progressi partita"
- **Scale**: 1-5
- **Anchors**: 1 = 3 colonne troppo strette, CI spezzato su 3 righe; 3 = accettabile; 5 = layout 2 righe, testo pulito, CI 1000→1022 in full width
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot + markup ispezionato.

### AC-8: Match List Card - Lucchetto Rimosso
- **Type**: `rule`
- **Given**: Pagina `/matches` con almeno una partita
- **When**: Visualizzo card lista
- **Then**: Nessuna icona Lock presente in basso a destra nella card (ma Lock rimane nel dettaglio sezione "Stato partita")
- **Pass Condition**: 0 occorrenze dell'icona Lock nella lista view
- **Evidence**: Screenshot + grep componente card lista.

### AC-9: Build & Typecheck
- **Type**: `rule`
- **Given**: Codice modificato in locale
- **When**: Eseguo `npx tsc --noEmit` e `next build`
- **Then**: Entrambi exit code 0, nessun errore
- **Pass Condition**: exit 0 per entrambi
- **Evidence**: Terminal output.

### AC-10: Cards Allineamento
- **Type**: `rubric`
- **Dimension**: Coerenza padding, gap, vertical alignment tra le cards delle pagine principali
- **Scale**: 1-5
- **Anchors**: 1 = padding disomogeneo (es px-3 vs p-6), icone che spostano testo, contenuto non centrato otticamente; 3 = accettabile; 5 = padding uniforme, gap coerenti, contenuto centrato, stesso radius, min-height per griglie, icon fixed-size shrink-0
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot confronto Dashboard/Stats/Profile cards + review codice classi Tailwind.

## Open Questions
Nessuna. I requisiti sono espliciti nel task utente. Eventuali problemi bloccanti rilevati durante l'implementazione verranno segnalati immediatamente.
