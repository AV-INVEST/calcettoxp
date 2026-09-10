# Tasks: CALCETTOXP — CORE SINGLE PLAYER V1

Ogni task mappa a uno o più AC di `spec.md`. Tutti i TR locali sono di tipo `rule` o `rubric`.

Status legenda: `pending`, `in_progress`, `completed`, `blocked`, `cancelled`.

---

## Task 1: Helper XP/LV + LV50 cap + rimozione LV75

**Priority**: high
**Maps to AC**: AC-XP1, AC-XP2, AC-XP4
**Scope**: [xp-levels.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/xp-levels.ts), [next-goal.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/next-goal.ts)
**Depends on**: none

Modifiche:

1. In `xp-levels.ts`:
   - Verificare e normalizzare `levelThresholds` a **esattamente 50 soglie per LV1..LV50** (ossia thresholds[0]=0 LV1 … thresholds[49]=LV50; oltre si rimane LV50).
   - Aggiungere l'helper `getLevelProgress(xp: number)` che restituisce:
     - `currentLevel`: integer 1..50
     - `currentThreshold`: soglia inferiore del LV corrente
     - `nextThreshold`: soglia superiore (se LV50 === LV50 threshold, stessa)
     - `xpInCurrentLevel`: xp − currentThreshold
     - `xpToNextLevel`: max(0, nextThreshold − xp)
     - `progressPct`: 0..100
   - `levelFromXp` rimane, ma clamp a LV50 max.

2. In `next-goal.ts`:
   - Rimuovere milestone `lv75`.
   - `lv50` lo lasciamo ma come tier `FREE` (non PRO, dato che LV50 è raggiungibile da FREE).

### Test Requirements

- **TR-1.1 (rule)**: `getLevelProgress(0)` → `{currentLevel:1, currentThreshold:0, xpInCurrentLevel:0}`.
- **TR-1.2 (rule)**: Per un XP che supera di gran lunga la soglia LV50, `currentLevel === 50 && progressPct === 100`.
- **TR-1.3 (rule)**: `ALL_MILESTONES` in `next-goal.ts` NON contiene più `lv75`.
- **TR-1.4 (rule)**: `pickNextGoal({ level: 50, isPro: true/false, ... })` non seleziona mai un obiettivo LV75.
- **TR-1.5 (rule)**: `npx tsc --noEmit` passa.

---

## Task 2: Evoluzione Player Card (status FREE per LV)

**Priority**: high
**Maps to AC**: AC-PC1, AC-PC2, AC-PC3
**Scope**: [PlayerCard.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/player/PlayerCard.tsx), [xp-levels.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/xp-levels.ts) (export status helper se utile)
**Depends on**: Task 1

Modifiche:

1. Aggiungere in `xp-levels.ts` (o in un file locale della card) helper `getStatusFromLevel(level: number)` → uno di `NOVIZIO | EMERGENTE | AFFERMATO | VETERANO | LEGGENDA`.
2. In `PlayerCard.tsx`:
   - Accetta prop `level` (già c'è); calcola status e mostra **badge di status** ben visibile in alto/es.
   - Introdurre un `STATUS_STYLE` che regola:
     - Bordo sinistro aggiuntivo / spessore
     - Glow intensità (box-shadow + eventuale `drop-shadow`)
     - Opacità corner decorations (es. NOVIZIO 0.4, LEGGENDA 1.0)
     - Un piccolo dettaglio (es. badge glow color, linea aggiuntiva sotto nickname)
   - Il tema CLASSIC è FREE; NIGHT/ELITE/NEON restano accessibili solo se `premiumBadge=true` (o nuova prop `isPro`): se FREE e theme diverso da CLASSIC, fallback a CLASSIC e ignora la richiesta (no crash).

### Test Requirements

- **TR-2.1 (rule)**: `getStatusFromLevel(1)=="NOVIZIO"`, `(5)=="EMERGENTE"`, `(15)=="AFFERMATO"`, `(30)=="VETERANO"`, `(50)=="LEGGENDA"`.
- **TR-2.2 (rule)**: Badge status è renderizzato nella card e visibile.
- **TR-2.3 (rule)**: FREE → tema NIGHT/ELITE/NEON viene declassato a CLASSIC senza errori.
- **TR-2.4 (rule)**: PRO → temi NIGHT/ELITE/NEON attivi.
- **TR-2.5 (rule)**: `npx tsc --noEmit` passa.

---

## Task 3: Validazioni Registrazione Partita + auto-result

**Priority**: high
**Maps to AC**: AC-M1, AC-M2, AC-M3, AC-M4, AC-M5, FR-4
**Scope**: [RegisterMatchForm.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/matches/RegisterMatchForm.tsx), [api/matches/route.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/api/matches/route.ts), [new/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/matches/new/page.tsx)
**Depends on**: Task 1 (per XP; ma può iniziare in parallelo se non tocca XP)

Modifiche client `RegisterMatchForm`:

1. Rimuovere i 3 bottoni WIN/DRAW/LOSS. Mostrare in tempo reale un badge `VITTORIA / PAREGGIO / SCONFITTA` calcolato da `goalsFor` vs `goalsAgainst` (solo come preview; server decide).
2. `cleanSheet` toggle: automaticamente disabilitato e reso false se ruolo !== POR; se POR ma `goalsAgainst > 0` mettere a false e disabilitare.
3. Sotto data/ora mostrare: "Puoi registrare partite fino a 72 ore fa" (invece di 24h).
4. Header page aggiornato: "Massimo 2 partite al giorno".

Modifiche server `api/matches/route.ts`:

1. Calcolare `derivedResult = goalsFor>goalsAgainst ? 'WIN' : goalsFor===goalsAgainst ? 'DRAW' : 'LOSS'` e usare **solo quello** (ignorare `body.result`; schema rimuovere `result` o renderlo opzionale e sovrascriverlo).
2. Window 72h invece di 24h: `const threeDaysAgo = new Date(nowUtc.getTime() - 72 * 60 * 60 * 1000)`.
3. Max 2 partite al giorno (non 3): `if (matchesSameDay >= 2) ...`.
4. Min 2h tra due partite dello stesso player: trovare la partita con `playedAt` più recente ≤ `playedAtDate + 2h`; se esiste ed entrambe le `playedAt` distano < 2h → errore.
5. Duplicato evidente: contare partite con stesso `playedAt`, stesso ruolo, stessi `goalsFor`, stessi `goalsAgainst`. Se `count > 0` → errore "Sembra che questa partita sia già stata registrata".
6. Messaggi di errore in italiano chiari (non i tecnicismi Zod per l'utente finale; quelli restano in `issues` per debug).
7. Confermare: `xpEarned` cap 150, `ciChange` clamp in [-20, +40].

### Test Requirements

- **TR-3.1 (rule)**: Schema Zod non richiede più `result` o viene sovrascritto; `POST` con qualsiasi body.result viene ignorato e rimpiazzato da `derivedResult`.
- **TR-3.2 (rule)**: Partita con playedAt futuro → 400 msg italiano.
- **TR-3.3 (rule)**: Partita con playedAt > 72h fa → 400 msg italiano.
- **TR-3.4 (rule)**: 3ª partita stesso giorno → 400 "Hai già registrato 2 partite oggi...".
- **TR-3.5 (rule)**: Partita con < 2h dalla precedente (stesso giocatore) → 400 con messaggio sul minimo di ore.
- **TR-3.6 (rule)**: Stesso playedAt+ruolo+punteggio già esistente → 400 partita duplicata.
- **TR-3.7 (rule)**: `goals > goalsFor` → 400.
- **TR-3.8 (rule)**: Clean sheet POR con goalsAgainst>0 sovrascritto a false; ruolo non POR clean sheet sempre false.
- **TR-3.9 (rule)**: Form UI mostra risultato calcolato in tempo reale.
- **TR-3.10 (rule)**: `npx tsc --noEmit` passa.

---

## Task 4: Redesign Dashboard core

**Priority**: high
**Maps to AC**: AC-D1, AC-D2, AC-D3, AC-D4, AC-D6, AC-RET1, AC-RET2
**Scope**: [dashboard/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/dashboard/page.tsx), eventuale nuovo componente `components/dashboard/XpLevelProgress.tsx`, `components/dashboard/StreaksCard.tsx`, `components/dashboard/RegisterMatchCTA.tsx` (max 2–3 nuovi file)
**Depends on**: Task 1, Task 2 (per status e helper XP)

Modifiche:

1. Nuovo ordine dall'alto:
   - Header + saluto
   - PlayerCard (grande, protagonista, status visibile)
   - Blocco **XP/LV** (helper Task 1): LV N, `attuale / prossima soglia XP`, barra, `XP mancanti al LV N+1` (o "LV MAX" a 50).
   - **CTA primaria grossa**: `REGISTRA PARTITA` → link `/matches/new`.
   - Riga compatta 2–4 metriche (CI, OVR, partite settimana, streak win).
   - Prossimo traguardo (NextGoalModule esistente, tenuto).
   - Streaks + record personale (miglior CI) + partite settimana.
   - Stagione corrente (CurrentSeasonCard esistente).
   - Ultime 5 partite (lista esistente, mantenuta ma compatta).
   - Infine il blocco MultiplayerComingSoon (o rimosso per compattezza — tenerlo in basso se presente).
2. Calcolare:
   - `matchesThisWeek`: partite con playedAt nella settimana ISO corrente (lun–dom; helper in `records.ts` o locale).
   - `currentWinStreak`, `currentUnbeatenStreak` (da array ordinato; usare `calcStreaks`-equivalente o scrivere helper locale).
   - `bestCareerIndex = Math.max(profile.careerIndex, maxPeakFromSeasons or max valueBefore/After in history)`.
3. Mobile: stack verticale; card larghezza 100%; niente overflow.
4. Desktop: griglia pulita, max-w 5xl, non stretch.

### Test Requirements

- **TR-4.1 (rule)**: PlayerCard è visibile per prima tra i moduli contenuti (dopo header).
- **TR-4.2 (rule)**: Blocco XP/LV rende 4 dati: LV corrente, XP soglie, progress %, XP al prossimo LV.
- **TR-4.3 (rule)**: CTA `REGISTRA PARTITA` è un `<Link href="/matches/new">` con stile `Button variant=primary size=lg` o equivalente.
- **TR-4.4 (rule)**: `matchesThisWeek` corrisponde alle partite giocate lun–dom correnti (verificabile con mock data o confronto playedAt).
- **TR-4.5 (rule)**: `currentWinStreak` e `currentUnbeatenStreak` calcolati correttamente su array ordinato per playedAt crescente; si spezzano a sconfitta/sconfitta rispettivamente.
- **TR-4.6 (rule)**: Nessun overflow orizzontale a 390px / 430px (verifica classi: `w-full`, `max-w-full`, griglie con gap adeguato).
- **TR-4.7 (rule)**: `npx tsc --noEmit` passa.

---

## Task 5: FREE vs PRO Teaser Dashboard

**Priority**: medium
**Maps to AC**: AC-D5, AC-FP1, AC-FP2, AC-FP3, AC-FP4
**Scope**: [dashboard/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/dashboard/page.tsx), nuovo componente `components/dashboard/ProTeasersCard.tsx` (o sezione locale), eventualmente `components/charts/CareerIndexChart.tsx` (per renderizzare di più se PRO)
**Depends on**: Task 4 (deve stare nella dashboard)

Modifiche:

1. FREE: aggiungere una sezione "Scopri di più con PRO" con 4 card teaser, ognuna con lock 🔒 e label:
   - `Temi premium NIGHT / ELITE / NEON` (mostrare 3 palette ridotte 🔒)
   - `Analisi forma 7 / 30 / 90 giorni` 🔒
   - `Storico completo Career Index` 🔒
   - `Record e statistiche avanzate` 🔒
   + Pulsante in calce: `SCOPRI PRO` → `/pricing`
2. PRO:
   - `CareerIndexChart`: se FREE → ultimi 20 (come ora); se PRO → tutti i dati disponibili (rimuovere `take:20` nella query solo per PRO).
   - Mostrare statistiche per ruolo (se dati) o messaggio "Dati insufficienti: servi più partite".
   - Mostrare record avanzati PRO da `records.ts`.
   - Rimuovere i teaser lock.
3. Verifica statica: `xp-levels.ts`, `career-index.ts`, `ovr.ts` non importano entilements e non differenziano FREE/PRO.

### Test Requirements

- **TR-5.1 (rule)**: FREE vede 4 teaser con lock + CTA SCOPRI PRO.
- **TR-5.2 (rule)**: PRO NON vede i lock e vede i moduli o messaggi "dati insufficienti".
- **TR-5.3 (rule)**: Carriera PRO carica più di 20 punti CI nel chart (se history > 20).
- **TR-5.4 (rule)**: Verifica statica: nessun file di formula (xp/career/ovr) legge `hasActivePro`.
- **TR-5.5 (rule)**: `npx tsc --noEmit` passa.

---

## Task 6: Overhaul MatchResultScreen (momento più importante)

**Priority**: high
**Maps to AC**: AC-R1, AC-R2, AC-R3, AC-R4, AC-R5, AC-PC1 (per nuovo status reveal)
**Scope**: [MatchResultScreen.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/matches/MatchResultScreen.tsx), [api/matches/route.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/api/matches/route.ts) (aggiungere campi `oldTotalXp` e `newTotalXp` nella response se mancano; `oldStatus`, `newStatus`)
**Depends on**: Task 1 (XP helper), Task 2 (status), Task 3 (registrazione partita già aggiornata)

Modifiche response API:

1. In `api/matches/route.ts` aggiungere alla risposta successo:
   - `oldXp: player.xp`
   - `newXp: newTotalXp`
   - (opz ma comodo per animazione) `oldThreshold`, `nextThreshold` correnti, oppure lasciar calcolare al client via `getLevelProgress`.
   - `oldStatus`, `newStatus` (per detect NUOVO STATUS).

Modifiche componente:

1. Fasi esplicite (invece di 0..3, usare 6 fasi) ma comunque rapide:
   - phase 0: risultato + score
   - phase 1: XP earned count up
   - phase 2: barra XP animata (vecchio → nuovo)
   - phase 3: CI OLD/NEW
   - phase 4: OVR OLD/NEW + LEVEL UP (se c'è)
   - phase 5: NUOVO STATUS reveal (se status diverso) + achievement + prossimo goal
2. **Barra XP cumulativa animata**:
   - usare `getLevelProgress(oldXp)` e `getLevelProgress(newXp)`.
   - Se LV cambia: animazione "riempi LV vecchio a 100%, pausa 150ms, reset barra e riempi fino a progresso del nuovo LV" (stato intermedio visibile).
   - Altrimenti animare da vecchio progresso a nuovo progresso.
3. LEVEL UP: banner grossa con stelle, "LEVEL UP LV X → LV X+1" (come ora ma più integrato).
4. NUOVO STATUS: banner separato se `newStatus != oldStatus` con testo `NUOVO STATUS: AFFERMATO` e mini preview PlayerCard con nuovo status (renderizzare la card piccola con nuovi style).
5. `prefers-reduced-motion`: hook `useReducedMotion` o media query. Se attivo, saltare animazioni e mostrare finale in 1 render.
6. CTA: primaria `TORNA ALLA DASHBOARD` (Home icon). "Registra un'altra" solo secondaria, o rimossa.
7. Prossimo traguardo: importare NextGoalModule o versione compatta e mostrare in fondo con i dati nuovi (passare `oldLevel` se lo conosciamo, o calcolare da nuovo player — la API restituisce nuovi dati di livello quindi ok).

### Test Requirements

- **TR-6.1 (rule)**: La API successo restituisce `oldXp` e `newXp`.
- **TR-6.2 (rule)**: Componente visualizza fasi progressive; count-up XP e barra XP animata.
- **TR-6.3 (rule)**: In caso di level-up, la barra mostra il riempimento del vecchio LV e poi il nuovo (visualmente verificabile o per mezzo di log di stato).
- **TR-6.4 (rule)**: LEVEL UP appare **solo** se `newLevel > oldLevel`.
- **TR-6.5 (rule)**: NUOVO STATUS appare **solo** se `newStatus != oldStatus`.
- **TR-6.6 (rule)**: `prefers-reduced-motion: reduce` → nessuna animazione; stato finale direttamente visibile (verifica con hook/conditional).
- **TR-6.7 (rule)**: CTA primaria: `TORNA ALLA DASHBOARD`.
- **TR-6.8 (rule)**: `npx tsc --noEmit` passa.

---

## Task 7: Coerenza dati e controlli finali

**Priority**: medium
**Maps to AC**: AC-M5, AC-XP2, AC-XP3, AC-FP3, AC-FP4, FR-8
**Scope**: verifica cross-file, [achievements.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/achievements.ts), eventuale correzione seed/migration se ci sono dati LV75 (ma **nessuna migration** finché non serve; fare check)
**Depends on**: Task 1..6

Modifiche:

1. `achievements.ts`: controllare che ci siano `LEVEL_10/25/50`. Se è presente un `LEVEL_75` (non dovrebbe esserci), rimosso/commentato. La seed iniziale (es. se uno script popolava achievement con LV75) va corretta (solo se esiste un riferimento).
2. In `ovr.ts`: confermare che `careerIndexToOverall` solo e non è chiamato altrove con parametri diversi (grep).
3. Controllare che in dashboard/registrazione nessuna formula differenzia FREE/PRO per XP/CI/OVR.
4. Confermare `cleanSheet` solo POR + goalsAgainst=0.

### Test Requirements

- **TR-7.1 (rule)**: Grep/ricerca statica non mostra usi di LEVEL_75 attivi nel codice di gioco.
- **TR-7.2 (rule)**: OVR non calcolato altrove che da CI (escludere assignamenti diretti arbitrari nel codice; le uniche scritture nel DB devono essere tramite `careerIndexToOverall`).
- **TR-7.3 (rule)**: CI delta rimane in [-20, 40] (assert testabile manualmente nel codice clamp).
- **TR-7.4 (rule)**: XP 150 max (cap presente).
- **TR-7.5 (rule)**: `npx tsc --noEmit` passa.

---

## Task 8: Qualità responsive + reduced motion finale + build

**Priority**: high
**Maps to AC**: AC-Q1, AC-Q2, AC-Q3, AC-Q4
**Scope**: tutti i file modificati, `globals.css` se serve, build/tsc
**Depends on**: Task 1..7

Modifiche:

1. Grep per `animate-` o CSS transition; aggiungere wrapper condizionali laddove mancassero con `prefers-reduced-motion` (es. barra XP, transition count-up se li usiamo, reveal level-up — già fatto in Task 6).
2. Verifica mobile 390/430:
   - Nessun overflow orizzontale (usare `max-w-full`, `min-w-0` dove serve; wrap flex).
   - PlayerCard e moduli non superano larghezza viewport.
3. Verifica desktop: centrato, max-w adeguato, non stretch.
4. Eseguire `npx tsc --noEmit`.
5. Eseguire `next build` se possibile (dipende da env/auth). Dichiarare se non eseguibile.

### Test Requirements

- **TR-8.1 (rule)**: `npx tsc --noEmit` passa.
- **TR-8.2 (rule)**: A 390px e 430px nessun componente sfora (ispezione visuale o controllo: nessun div senza `max-w-full` dentro griglie con gap; nessun testo lungo senza `truncate`).
- **TR-8.3 (rule)**: Almeno `MatchResultScreen`, count-up XP/CI, barra XP animata rispettano `prefers-reduced-motion`.
- **TR-8.4 (rubric)**: Qualità responsive complessiva 0–2, soglia ≥ 1.5.
- **TR-8.5 (rule)**: Build locale: eseguita o dichiarata non eseguibile (per motivi di env/auth).

---

## Fine piano

Dipendenze totali:

```
Task1 → Task2 → Task4 → Task5 → Task7 → Task8
     ↘ Task3 → Task6 ↗
```

Task 1, 3 possono iniziare in parallelo (Task3 non dipende da Task1, ma dalla buona volontà di non rompere XP; in realtà la API usa XP già definiti quindi si può fare in parallelo).
