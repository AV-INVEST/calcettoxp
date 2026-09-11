# Tasks: Card Architecture + UX Overhaul

Ogni task mappa 1+ Acceptance Criteria (AC) di spec.md. Priorità: high = blocking per milestone, medium = UX polish, low = optional cleanup.
Stati: pending | in_progress | completed | cancelled | blocked.
Ogni task completato deve includere Completion Evidence (output comandi, screenshot path, o riferimento a linee codice).

---

## Task 1: Card Attributes — Sample Size Confidence Smoothing (core logic)
- **Priority:** high
- **AC:** AC-6
- **File:** [card-attributes.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/card-attributes.ts)
- **Descrizione:**
  1. Introdurre una funzione helper `withConfidence(raw: number, baseline: number, matchesPlayed: number, fullConfidenceAt = 15)` che applica:
     ```
     confidence = min(1, matchesPlayed / fullConfidenceAt)
     return clampInt(baseline + (raw - baseline) * confidence, 0, 99)
     ```
  2. Applicare lo smoothing a:
     - `calculateResults` (baseline 50)
     - `calculateImpact` (baseline 50)
     - `calculateScoring` (baseline 50)
     - `calculateConsistency` (baseline 50; già con <2 matches ritorna 50 — applicare comunque smoothing sopra per gradualità)
     - `calculateForm` (baseline 50; da valutare se smoothing serve, ma non farebbe male).
  3. **NON** applicare a `calculateExperience` (è già progressivo per partite/livello).
  4. Firmare la funzione esportata `calculateCardAttributes` in modo che passi `matchesPlayed` dentro ogni helper smoothing (o accettare `matchesPlayed` come secondo parametro dello smoothing direttamente nel corpo di ogni `calculateXxx`).
- **Test Requirements (TR):**
  - **rule** TR-1a: esportare una testable function `__smokeTestCardAttributes` in fondo al file (o in scripts/) che restituisca i valori calcolati per i fixture:
    - 0 match → tutti baseline ~50
    - 1 match (W, 2G 1A, ruolo ATT, avg CI change alto) → Impact/Results/Scoring **50–65** (non 99)
    - 3 match (2W 1L, 5G 2A totali) → ~60–75
    - 5 match → ~70–85
    - 10 match → ~85–95
    - 15+ match → ~ valore raw (90–99 se prestazioni eccezionali)
  - **rubric** TR-1b: Progressione graduale — score 0/1/2 con soglia ≥ 2. Evidenza = valori stampati per ogni fixture.
  - **rule** TR-1c: OVR non toccato (sempre letto da `playerProfile.overall`; il file card-attributes non lo include → confermato).
- **Completion Evidence:** output console dei 6 fixture; link a linee modify.

---

## Task 2: Fix computeActiveStreaks — loop corretto senza break prematuro
- **Priority:** high
- **AC:** AC-7
- **File:** [retention.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/retention.ts)
- **Descrizione:**
  1. Riscrivere `computeActiveStreaks`. Le regole (matches ordinati newest-first):
     - Win streak: inizia contatore. WIN → incrementa; DRAW/LOSS → break.
     - Unbeaten: WIN/DRAW → incrementa; LOSS → break.
     - Loss streak: LOSS → incrementa; WIN/DRAW → break.
     - Aggiungere `lossStreak` nella ActiveStreaks type (già presente, confermare).
  2. **NON** toccare `countMatchesThisWeek` e `getBestCareerIndex`.
  3. Opzionale ma consigliato: estrarre una utility condivisa (o importare e riusare la logica di `achievement-engine.calcStreaks` rinominandola in modo da usare una sola implementazione per entrambe le code path). Se divergenza: scrivere test per entrambe.
- **Test Requirements (TR):**
  - **rule** TR-2a: [W] → win=1, unbeaten=1.
  - **rule** TR-2b: [W,W] → win=2.
  - **rule** TR-2c: [W,W,D] (newest-first order: W at index 0, W at 1, D at 2) → win=2, unbeaten=3.
  - **rule** TR-2d: [D,W,W] (D newest) → win=0, unbeaten=3.
  - **rule** TR-2e: [L,W,W] → win=0, unbeaten=0, loss=1? No, loss streak su [L,W,W] newest-first: L è newest → loss=1, poi W lo interrompe. Conferma: loss=1.
  - **rule** TR-2f: [W×6, L] (6 W, newest L) → win=0, unbeaten=0, loss=1.
  - **rule** TR-2g: [W, L, W×6] (ordine newest-first: W, L, W×6) → win=1, poi L interrompe le 6 W passate (non consecutive dal newest). Quindi win=1, unbeaten=1.
  - **rule** TR-2h: UI in dashboard — winStreak=1 visualizza "1 vittoria" o equivalente (vedere Task 9).
- **Completion Evidence:** output test runner 7 casi sopra.

---

## Task 3: Fix Career Index Change rendering — rimuovere % sbagliato
- **Priority:** high
- **AC:** AC-8
- **Files:**
  - [PlayerCard.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/player/PlayerCard.tsx) (riga ~628–632: span con `%` dopo careerIndexChange)
  - [DashboardCardStage.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/dashboard/DashboardCardStage.tsx) (LockedProCardPreview riga ~413–420: stesso pattern)
  - Audit: `dashboard/page.tsx` sezione OVR/CI/LV mobile/desktop per stesso pattern.
- **Descrizione:**
  1. Sostituire ogni rendering di `careerIndexChange` che appende `%` con il formato `+XX CI` o solo `+XX` (decidere in base alla spaziatura; preferenza `+XX CI` dove entra).
  2. Nella sezione OVR/CI/LV del dashboard (riga ~483 mobile e ~431–442 desktop) — assicurarsi che lo stesso delta non abbia `%`; se non ha % già, lasciare invariato.
- **Test Requirements (TR):**
  - **rule** TR-3a: grep per `careerIndexChange` in tutti i file ts/tsx — nessuna occorrenza `%` deve essere appesa direttamente al valore, eccetto il caso in cui sia calcolata davvero come `(delta/prev)*100`.
  - **rule** TR-3b: visualizzando 1000→1022 → delta 22 mostrato come `+22` o `+22 CI`.
- **Completion Evidence:** diff file modificati + grep output.

---

## Task 4: Bottom Nav — Sostituire Statistiche → Card (/dashboard)
- **Priority:** high
- **AC:** AC-1, AC-15
- **File:** [MobileBottomNav.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/layout/MobileBottomNav.tsx)
- **Descrizione:**
  1. Importare `IdCard` da lucide-react (rimuovere `BarChart2` se non usato altrove; altrimenti mantenere import).
  2. `navItems` order:
     - `/profile` — User — Profilo
     - `/matches` — SoccerBallIcon — Partite
     - [FAB button centrale separato — /matches/new]
     - `/achievements` — Trophy — Trofei
     - `/dashboard` — **IdCard** — **Card** (sostituisce `/stats` + BarChart2 + Statistiche).
  3. Active state: `pathname.startsWith("/dashboard")` → verde elettrico + scale-110.
- **Test Requirements (TR):**
  - **rule** TR-4a: bottom nav renderizza PROFILO | PARTITE | + | TROFEI | CARD.
  - **rule** TR-4b: Card punta a `/dashboard`.
  - **rule** TR-4c: `/dashboard` attiva colore verde elettrico nella voce Card.
- **Completion Evidence:** screenshot mobile + codice.

---

## Task 5: Home CTA logged-in — "LA MIA CARD" + breathing glow
- **Priority:** high
- **AC:** AC-2
- **File:** [page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/page.tsx) (hero section SmartCTA con loggedInLabel)
- **Descrizione:**
  1. Cercare lo SmartCTA con `loggedInLabel="VAI ALLA DASHBOARD"` (circa riga 694) → sostituire con `loggedInLabel="LA MIA CARD"`.
  2. Icon prop: usare `IdCard` (invece di PlaySquare se questo è il default; lo SmartCTA prende icon dal chiamante — assicurarsi che l'icona della versione loggedIn sia IdCard). Nota: lo SmartCTA attuale usa `PlaySquare` come default. Passare icon=IdCard per la hero.
  3. Aggiungere una micro animazione breathing glow:
     - Soluzione: classe CSS personalizzata o Tailwind arbitrary, es. `animate-breathing-glow` con `@keyframes breathing-glow { 0%,100% { box-shadow: ... greenElectric/25 } 50% { box-shadow: ... greenElectric/45 } }` della durata ~3s.
     - Alternativa: inline style animation.
     - No bounce.
- **Test Requirements (TR):**
  - **rule** TR-5a: CTA authenticated mostra label LA MIA CARD.
  - **rule** TR-5b: animazione non invadente (nessun bounce; solo glow periodico).
- **Completion Evidence:** diff + screenshot.

---

## Task 6: Dashboard/Card — Riorganizzazione sezioni + Record personali integrazione + 1 CTA PRO
- **Priority:** high
- **AC:** AC-4, AC-5, AC-11, AC-10, AC-15 (metadata/title)
- **File:** [dashboard/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/dashboard/page.tsx)
- **Descrizione:**
  1. **Metadata & Heading:** aggiornare metadata.title a "La mia Card | CalcettoXP"; aggiornare l'heading "Dashboard" o messaggio di benvenuto per riferirsi a "Card" invece che a "Dashboard" dove appropriato (senza forzature).
  2. **Rimuovere sezione duplicata "STATS 2x2 mobile + Win Rate"** (attuale sezione #10, righe ~993–1070 circa) che mostra Partite/Vittorie/Gol/Assist + winRate — questi valori sono già nel Profilo e in forma migliore.
  3. **Ordinamento sezioni** rispettare:
     (a) Player Card protagonista
     (b) Condividi la mia Card (già c'è; va bene)
     (c) OVR / CI / LV  (già c'è; va bene)
     (d) XP bar cumulativa (spostare prima di CI chart per coerenza "progresso")
     (e) 4 box forma Streak/Settimana/Stagione/Miglior CI (sezione #6 oggi; spostare dopo XP bar o mante nere? Mantenere dopo CI chart per narrativa "crescita").
     (f) Career Index Chart (sezione #9 oggi; spostare dopo i 4 box forma per avere "evoluzione → andamento")
     (g) Ultime partite
     (h) Record personali (**nuova sezione importata/integrata da /stats**)
     (i) Stagione corrente compatta
     (j) Next goal / Prossimo traguardo o Prossimo trofeo (compatti)
     (k) Analytics PRO (period stats + role stats) + CTA PRO principale
     (l) Upsell Premium (box grande "Passa a PRO per statistiche avanzate")
     (m) Rimuovere duplicati di CTA PRO prima di questo box (se ne esistono altri di grandi dimensioni).
  4. **Integrare sezione "Analisi periodo 7/30/90 + Statistiche per ruolo + Record + Andamento stagioni"** da /stats nella Card — ma mantenendo gating PRO:
     - Per FREE: mostrare solo il grande up-sell PRO (con lista benefici) e/o delle card locked.
     - Per PRO: mostrare sezione Analisi 7/30/90 giorni e Statistiche per ruolo (se ha >1 ruolo).
     - Record personali (FREE quelli FREE, PRO quelli PRO) vanno sempre mostrati (sezione dedicata).
  5. **Spostare PersonalRecordsCard** da stats page → dashboard. Attenzione: quella pagina stats usa `PersonalRecordsCard` già pronto, ma nella dashboard è necessario ricreare struttura simile o riusare lo stesso componente.
  6. **Max 1 CTA PRO forte**: il box grande "Passa a PRO per statistiche avanzate" con corona è l'upsell principale. Eventuali CTA PRO più piccole e secondarie (es. "Sblocca per vedere X" dentro una sezione specifica) sono accettate solo se minimali (badge lock + piccola label, non button giganti).
  7. **Rimuovere sezione "Vantaggi esclusivi" multipla PRO teasers** (sezione 13 oggi a pagina dashboard) a favore del solo box PRO grande (max 1 CTA forte).
  8. **Rimuovere la CTA "Registra partita" enorme** dopo i 4 box se necessario (decidere implementatore: è unica e prominente, quindi se è una sola è ancora accettabile — non è PRO upsell. Si può mantenere ma è meglio tenerla se non crea conflitti; la regola è "1 CTA PRO forte" non "1 CTA in assoluto").
- **Test Requirements (TR):**
  - **rule** TR-6a: nel sorgente dashboard <= 1 CTA PRO gigante (button con "PASSA A PRO" in evidenza full-width o simili).
  - **rule** TR-6b: Record personali sono visibili nella dashboard e gating FREE/PRO è rispettato.
  - **rule** TR-6c: Le stats 7/30/90 e stats per ruolo sono visibili solo a PRO.
  - **rubric** TR-6d: Ordine sezioni UX "card → crescita → performance → record → premium" rispettato — 0/1/2 soglia ≥ 2.
- **Completion Evidence:** elenco sezioni finali + screenshot.

---

## Task 7: /stats → redirect /dashboard + audit link interni a /stats
- **Priority:** high
- **AC:** AC-4, AC-15
- **Files:**
  - [stats/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/stats/page.tsx) (diventa un semplice `redirect("/dashboard", NextRedirect permanent)` Next.js)
  - Audit con `grep -r '/stats' src/` per sostituire link interni.
- **Descrizione:**
  1. Sostituire il contenuto di `/stats/page.tsx` con redirect a `/dashboard`. Usare `redirect(...)` built-in di next/navigation, permanent=true (308) o default 307; va bene entrambi.
  2. grep per `/stats` in tutti i file TS/TSX/CSS sotto `src/`. Ogni link interno `/stats` diventa `/dashboard` (comprese label tipo "Vai alle statistiche" → "Vai alla Card" se di copy).
- **Test Requirements (TR):**
  - **rule** TR-7a: Navigare `/stats` redirige a `/dashboard` (verifica browser o response header).
  - **rule** TR-7b: Nessun link interno hardcoded `/stats` rimasto (grep output vuoto per `/stats` non API routes).
- **Completion Evidence:** grep results + redirect code.

---

## Task 8: Rimuovere badge PRO decorativi ridondanti
- **Priority:** medium
- **AC:** AC-9
- **Files:**
  - [profile/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/profile/page.tsx) — locked seasons preview.
  - [DashboardCardStage.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/dashboard/DashboardCardStage.tsx) — LockedProCardPreview top bar PRO·Anteprima (valutare rimozione PRO).
  - [dashboard/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/dashboard/page.tsx) — eventuali badge PRO decorativi in card già gold/obsidian.
- **Descrizione:**
  - Dove esistono contemporaneamente **corona + lock + design gold/ossidiana**, rimuovere la pill `<Badge variant="elettrico">PRO</Badge>`.
  - Dove il contesto è piano/entitlement (es. badge nell'header profilo che dice "FREE o PRO account") — **NON** rimuovere.
  - CTA finali come `<Button>PASSA A PRO</Button>` — **NON** rimuovere.
- **Test Requirements (TR):**
  - **rule** TR-8a: locked profile stagione card (corona + lock + gold) NON ha più badge PRO testuale.
  - **rule** TR-8b: LockedProCardPreview (DashboardCardStage) — top bar mantiene Corona + Lock + "Anteprima" ma rimuove "PRO" se ci sono corona e lock.
- **Completion Evidence:** screenshot before/after o diff.

---

## Task 9: 4 Box forma — coerenza + copy Streak aggiornato
- **Priority:** medium
- **AC:** AC-7 (UI parte), AC-12
- **File:** [dashboard/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/dashboard/page.tsx) sezione 4 box (Streak, Settimana, Stagione, Miglior CI).
- **Descrizione:**
  1. UI copy per Streak:
     - `winStreak === 1` → valore = `1`, copy = "1 vittoria".
     - `winStreak >= 2` → valore = `${N}W`, copy = `${N} vittorie`.
     - Else if `unbeatenStreak === 1` → `1U`, "1 imbattuto".
     - Else if `unbeatenStreak >= 2` → `${N}U`, `${N} imbattuto`.
     - Else if `lossStreak >= 1` → `${N}L`, `${N} sconfitte`.
     - Else (0) → `—`, "Inizia la striscia".
  2. Rimuovere la condizione `streaks.winStreak >= 2` oggi presente (`activeStreakLabel` e `activeStreakPositive` usano soglia 2). Deve partire da 1.
  3. Uniformare padding, min-height, gap tra i 4 box:
     - `min-h-[120px]` sui 4.
     - `px-3 py-5` per mobile.
     - Icone fixed-size `size={14}` shrink-0.
     - Label uppercase con whitespace-nowrap.
     - Valore tabular-nums shrink-0.
     - Copy leading-snug shrink-0.
- **Test Requirements (TR):**
  - **rule** TR-9a: 1W visualizza "1 vittoria", non "—".
  - **rule** TR-9b: 4 box hanno stessa altezza visuale.
- **Completion Evidence:** screenshot + copy update.

---

## Task 10: Profilo — pulizia ridondanze e max 1 CTA PRO forte (non analytics nella pagina)
- **Priority:** medium
- **AC:** AC-3, AC-10
- **File:** [profile/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/profile/page.tsx)
- **Descrizione:**
  1. Verificare che la pagina profilo NON contenga analytics avanzate duplicate (es. CI chart, stats period). Oggi contiene: riepilogo carriera BASE (partite, V/P/S, gol, assist, clean sheet, win rate) + preview trofei + link "Vedi tutti" + storico stagioni. Se vede altro di analytics, valutare rimozione.
  2. Confermare 1 sola CTA PRO forte (storico "Storico completo · Tutte le stagioni" upsell). Non aggiungerne altre.
  3. Badge PRO decorativi già rimossi in Task 8 — confermare che l'upsell PRO usa corona + lock + CTA PASSA A PRO solo.
- **Test Requirements (TR):**
  - **rule** TR-10a: <= 1 CTA PRO grande button nella pagina.
  - **rule** TR-10b: Nessun CI chart o analisi 7/30/90 nel profilo.
- **Completion Evidence:** diff se necessari + screenshot.

---

## Task 11: FREE/PRO gating audit — integrazione Card
- **Priority:** high
- **AC:** AC-14
- **Scope:** Le modifiche di Task 6, 10.
- **Descrizione:**
  - Free user visitando `/dashboard`:
    - CI chart limitato a ultimi 20 punti. ✓ già nel codice con `take: isPro ? undefined : 20`.
    - Non vede Analisi 7/30/90.
    - Non vede Statistiche per ruolo.
    - Non vede record di tier PRO in Record personali.
    - Vede il grande box "Passa a PRO per statistiche avanzate".
  - Pro user:
    - Tutte le sezioni sopra sbloccate.
    - Non vede up-sell PRO grande (o vede solo piano esistente).
- **Test Requirements (TR):**
  - **rule** TR-11a: Free → nessun leak valori reali in period stats o role stats (devono essere locked o assenti).
  - **rule** TR-11b: Pro → vede contenuti integrati senza filtro a 20.
- **Completion Evidence:** verifica manuale del codice gating.

---

## Task 12: Mobile QA fixes 390px / 430px
- **Priority:** medium
- **AC:** AC-13
- **Scope:** tutte le pagine modificate.
- **Descrizione:**
  - Verificare viewport 390 e 430:
    - Nuova bottom nav visibile, 5 elementi non schiacciati.
    - Player Card: attributi tutti visibili, nessun testo contro bordo.
    - OVR/CI/LV 3 colonne mobile: valori non troncati.
    - 4 box forma: stessa altezza, contenuti centrati, icone e label con shrink-0.
    - CI chart no horizontal scroll.
    - Ultime partite card: layout multi-riga mobile OK (già multi-riga oggi; confermare).
    - Record personali card: wrapping OK.
    - CTA PRO upsell visibile e non tagliata.
  - Aggiustare con `min-w-0`, `whitespace-nowrap` su valori, `truncate` solo su label secondarie (mai su valori CI/OVR/LV).
  - NO `overflow-x:hidden` globale.
- **Test Requirements (TR):**
  - **rubric** TR-12a: visual inspection 390px — score 0 (overflow/overlap) / 1 (minori) / 2 (nessun problema). Soglia ≥ 2.
  - **rubric** TR-12b: visual inspection 430px — soglia ≥ 2.
- **Completion Evidence:** screenshot 390/430 per ogni sezione.

---

## Task 13: Script/test logici (card attributes + streak + trophy streak)
- **Priority:** high
- **AC:** AC-6, AC-7
- **Descrizione:**
  1. Creare `scripts/card-attributes-test.ts` (o eseguire node -e) che invoca `calculateCardAttributes` con 6 fixture da TR-1a e stampa output.
  2. Creare `scripts/retention-streak-test.ts` che invoca `computeActiveStreaks` per i 7 casi TR-2a..TR-2g e stampa pass/fail.
  3. Confermare trophy streak: rieseguire (se esiste) `scripts/trophy-engine-test.ts` o simulare con dati mock che `calcStreaks` (achievement-engine) continua a passare per casi di confronto.
- **Test Requirements (TR):**
  - **rule** TR-13a: output test card-attributes: i 6 valori di 1 match sono in range 50–65.
  - **rule** TR-13b: output test streak 7/7 pass.
  - **rule** TR-13c: trophy streak (calcStreaks in engine) non è stato modificato → se non si tocca, segnare come pass per assenza di modifiche. Se toccato, rieseguire.
- **Completion Evidence:** stdout salvato di ogni test.

---

## Task 14: tsc + next build
- **Priority:** high
- **AC:** AC-16
- **Descrizione:**
  ```
  npx tsc --noEmit
  npx next build
  ```
  Risolvere ogni errore type/build.
- **Test Requirements (TR):**
  - **rule** TR-14a: tsc exit 0.
  - **rule** TR-14b: next build exit 0.
- **Completion Evidence:** log completo salvato.

---

## Task 15: Report finale (formato 14 punti come da Richiesta utente #20)
- **Priority:** low
- **Descrizione:** al termine, produrre un report in italiano come testo libero:
  1. Nuova architettura bottom nav
  2. Cosa spostato da Stats a Card
  3. Cosa rimosso perché ridondante
  4. Nuova logica Card attributes
  5. Valori ottenuti esempio 1-match
  6. Fix streak
  7. Fix Career Index +22%
  8. Badge PRO/CTA rimossi
  9. FREE/PRO gating verificato
  10. Mobile 390/430
  11. Test streak/card
  12. tsc
  13. build
  14. Problemi reali ancora aperti (se non applica, dire "nessuno").
- **Completion Evidence:** il report stesso.

---

## Dipendenze & Ordine Esecuzione
1 → logic pure (card-attributes, retention) — no dipendenze.
2 → subito dopo 1 o in parallelo.
3 → insieme a 1/2.
4 → indipendente.
5 → indipendente.
7 → indipendente (ma tenere vicino a Task 6 per routing).
6 → dopo 1, 2, 3, 7 (perché Dashboard usa tutti gli output).
8 → insieme a 6 o dopo 6.
9 → insieme a 6 o dopo 6 (usa dati Task 2).
10 → dopo 8.
11 → dopo 6.
12 → dopo 6, 9, 10, 11.
13 → dopo 1 e 2.
14 → dopo tutte le altre modifiche.
15 → dopo 14.

## Assunzioni & Note
- Nessuna migration/scrittura DB.
- `/dashboard` route rimane `/dashboard` (no refactor URL).
- Il pulsante FAB centrale "+" in bottom nav NON viene modificato, ma l'ordine intorno cambia per ottenere PROFILO | PARTITE | + | TROFEI | CARD. Attualmente MobileBottomNav splitta navItems in slice(0,2) prima del FAB e slice(2) dopo; quindi navItems corretto = [Profile, Matches, Trofei, Card] e slice(0,2) = Profile,Matches prima del FAB, slice(2) = Trofei,Card dopo — ottenendo PROFILO | PARTITE | + | TROFEI | CARD. Verificare che navItems array length sia 4:
  navItems = [
    { href: "/profile", ... Profilo },
    { href: "/matches", ... Partite },
    { href: "/achievements", ... Trofei },
    { href: "/dashboard", ... Card },
  ];
  FAB è separato come button. Ordine visivo corretto: navItems.slice(0,2) → FAB → navItems.slice(2).
