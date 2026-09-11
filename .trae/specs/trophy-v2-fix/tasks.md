# CalcettoXP - Trophy V2 Fix & UI Polish - Implementation Plan

## Task 1: Trophy Engine - Fix distinctSeasonsPlayed source of truth
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Modificare `buildAggregatorContext` in [achievement-engine.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/achievement-engine.ts#L138-L144): sostituire la query su `playerSeason` con `COUNT(DISTINCT Match.seasonKey) WHERE Match.playerId = profileId`.
  - Assicurarsi che Match con seasonKey NULL non vengano contati (se esistono).
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `rule` TR-1.1: Con un profilo che ha 1 Match con seasonKey="S1" e 2 record PlayerSeason ("S1", "S2"), distinctSeasonsPlayed deve essere 1. Evidence: test unità o query READ-ONLY sul DB Neon.
  - `rule` TR-1.2: Un profilo con 0 Match ha distinctSeasonsPlayed = 0 (non 1 per la stagione corrente). Evidence: test unità.
- **Notes**: Sola modifica query, nessuna migrazione schema.

## Task 2: Trophy Engine - Implementare reconcileAchievementsForProfile idempotente
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Creare funzione pubblica `reconcileAchievementsForProfile(profileId, opts?: { dryRun?: boolean; context?: AggregatorContext })` in `achievement-engine.ts`.
  - Logica: calcola 50 trophy da source of truth → per ogni entry FREE con `requirementMet` e senza PlayerAchievement → create. Per PRO entry + isPro user + requirementMet → create. NON duplicare entry già presenti.
  - NON cancellare automaticamente PlayerAchievement sbloccati ma matematicamente non validi → flaggarli in report.
  - NON modificare XP/CI/OVR.
  - Opzione dry-run restituisce report senza write.
  - Aggiornare `persistUnlocksForProfile` per usare internamente la stessa logica (evitare duplicazioni).
  - Richiamare la reconcile (NON dry-run) nei punti corretti: route match POST dopo creazione (dove già chiama checkAchievementsAfterMatch), share track valido, referral confirmed (onboarding route), dopo upgrade PRO/webhook dove rilevante.
  - **NON** chiamare durante rendering pagine.
- **Acceptance Criteria Addressed**: AC-1 (unlock Primo Passo), AC-2, AC-3
- **Test Requirements**:
  - `rule` TR-2.1: 2 chiamate consecutive reconcile producono lo stesso COUNT di PlayerAchievement. Evidence: query prima/dopo.
  - `rule` TR-2.2: Dry-run restituisce numero di unlock pianificati > 0 per utente con 1 Match e PRIMO_PASSO non ancora sbloccato. Evidence: report dry-run.
  - `rule` TR-2.3: Dopo reconcile reale, PlayerAchievement per chiave "PRIMO_PASSO" ha unlockedAt non null. Evidence: query DB.
- **Notes**: Esportare la funzione per poterla chiamare da eventuali script.

## Task 3: Trophy Reconciliation - READ-ONLY diagnosis e DRY-RUN su Neon reale
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - Eseguire query READ-ONLY su tutti i profili esistenti:
    - `PlayerProfile.matchesPlayed` vs `COUNT(Match)` vs `COUNT(DISTINCT Match.seasonKey)`
    - Conteggio PlayerAchievement esistenti per FREE unlocked.
  - Per ogni profilo, eseguire `reconcileAchievementsForProfile` in modalità `dryRun: true`.
  - Stampare report aggregato: quanti FREE unlock mancanti, quanti PRO unlock mancanti, quanti PlayerAchievement "sospetti" (sbloccati ma non validi).
  - **NESSUNA SCRITTURA** in questa fase.
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `rule` TR-3.1: Report dry-run generato con numeri chiari. Nessun write al DB. Evidence: stdout/log + check COUNT inalterato prima e dopo.
  - `rule` TR-3.2: Se un profilo ha COUNT(Match)=1 allora DISTINCT Match.seasonKey=1 e dry-run riporta che "Secondo Capitolo" dovrebbe essere a 1/2 (non 2/2). Evidence: riga specifica nel report.
- **Notes**: Fermo qui e attesa conferma prima del write.

## Task 4: Trophy Reconciliation - Esecuzione safe (dopo approvazione del dry-run)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3, Approvazione utente sul report dry-run
- **Description**:
  - Se il report dry-run conferma che le modifiche sono solo CREATE/UPSERT di achievement mancanti corretti (nessun delete massivo), eseguire reconcile reale per tutti i profili.
  - Confermare che i "PlayerAchievement sospetti" (se esistono) siano solo segnalati, non cancellati.
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `rule` TR-4.1: Dopo reconcile, per il profilo con 1 match, PRIMO_PASSO.unlockedAt non è null. Evidence: query.
  - `rule` TR-4.2: COUNT PlayerAchievement dopo = COUNT prima + N unlock nuovi (come da dry-run). Evidence: confronto.
  - `rule` TR-4.3: Nessun PlayerAchievement è stato cancellato (COUNT delle righe non diminuisce per nessun profilo). Evidence: confronto.
- **Notes**: Procedere solo se il report Task 3 è approvato dall'utente.

## Task 5: Audit completo 50 Achievement - verifiche metriche e test deterministici
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - Rivedere `progressForEntry` e `calcRoleMetrics` per ogni RequirementKind.
  - Verificare:
    - LIFETIME_MATCHES = profile.matchesPlayed
    - LIFETIME_WINS = profile.wins
    - STREAK_UNBEATEN / STREAK_WIN = calcStreaks su recent match desc order
    - SHARE_VALID_DAYS = COUNT DISTINCT ShareRecord.dayKey
    - REFERRAL_CONFIRMED = COUNT Referral WHERE status='CONFIRMED'
    - SEASONS_DISTINCT = (ora corretto da Match)
    - ROLE_AGGREGATE:
      - ATT_GOALS: SUM match.goals WHERE role='ATT'
      - CEN_ASSISTS: SUM match.assists WHERE role='CEN'
      - DIF_MATCHES_LE1_AGAINST: COUNT match WHERE role='DIF' AND goalsAgainst <=1
      - POR_CLEAN_SHEETS: COUNT match WHERE role='POR' AND goalsAgainst =0 (o cleanSheet=true, verificare coerenza)
    - FIRST_CONTRIBUTION: goals>=1 OR assists>=1 OR cleanSheets>=1 OR penaltiesSaved>=1
    - LIFETIME_LEVEL, LIFETIME_CI, LIFETIME_XP: da aggregati profilo
  - Creare piccoli test/scrip di verifica deterministici con fixture minime per le famiglie principali.
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-5.1: Con fixture 5 WIN consecutive → STREAK_WIN=5, STREAK_UNBEATEN=5. Evidence: test.
  - `rule` TR-5.2: Con fixture POR role 3 partite con GA=0 → POR_CLEAN_SHEETS=3. Evidence: test.
  - `rule` TR-5.3: Con fixture DIF role 2 partite GA<=1 → DIF_MATCHES_LE1_AGAINST=2. Evidence: test.
  - `rubric` TR-5.4: Audit completezza delle 12 famiglie. Scale 1-5; 1=metrica sbagliata, 3=metrica corretta ma senza verifica diretta, 5=tutte metriche verificate con test o confronto query DB; threshold >=4. Evidence: file di test o script.
- **Notes**: Non modificare requisiti numerici dei 50 trophy.

## Task 6: Coerenza FREE/PRO gating tra Dashboard / Profile / Stats
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Audit di Dashboard, `/profile`, `/stats` per le metriche:
    - Analytics 7/30/90 giorni → solo PRO.
    - Storico completo stagioni (>1) → solo PRO.
    - Confronto tra stagioni → solo PRO.
    - Statistiche per ruolo → solo PRO.
    - Record avanzati / streak avanzati → solo PRO.
    - CI Chart: FREE = 20 punti, PRO = illimitato (controllo uniforme).
  - Se in Dashboard c'è uno storico CI illimitato per FREE → correggere a 20 punti (già presente linea 137 take: isPro ? undefined : 20, verificare che sia applicato uniformemente).
  - In `/profile`: "Storico completo" blocco: FREE vede solo stagione corrente, stagioni precedenti locked.
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-6.1: Nessuna analytics 7/30/90g appare in FREE in qualunque pagina. Evidence: grep + confronto 3 pagine.
  - `rule` TR-6.2: CI chart in Dashboard e Stats applica lo stesso take (20 FREE / ∞ PRO). Evidence: confronto codice.
- **Notes**: Non nascondere metriche FREE base (OVR, CI, LV, partite V/P/S, gol/assist).

## Task 7: Rimuovere CTA PRO duplicate / ridondanti
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - `/stats/page.tsx`: Rimuovere la prima card "Stagione corrente locked" (intorno alle righe 413-465). **Mantenere** la seconda card principale "Passa a PRO per statistiche avanzate" (~riga 468+) con corona grande e lista benefici.
  - `/profile/page.tsx`: Rimuovere la CTA inline "Sblocca" dentro la riga stagione bloccata (intorno riga 638-657). Consolidare: la preview locked delle stagioni rimane (con corona e lock visivo), ma la CTA forte è solo la card in basso "Storico completo · Tutte le stagioni". Eliminare ridondanza.
  - `/dashboard`: Verificare che la sezione "Vantaggi esclusivi" sia l'unica CTA PRO presente. Non aggiungere altro.
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-7.1: `/stats` FREE ha 1 sola CTA PRO forte. Evidence: grep testi "Sblocca PRO" + "Passa a PRO" per pagina = 1 CTA esplicita pulsante.
  - `rule` TR-7.2: `/profile` FREE ha 1 solo blocco PRO "Storico" con CTA (non 2). Evidence: markup/screenshot.
- **Notes**: Eliminare ridondanza, mantenere qualità percepita.

## Task 8: Mobile UX - Dashboard Ultime Partite layout 2 righe
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Ridisegnare il markup interno alla card di ogni match in [dashboard/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/dashboard/page.tsx#L803-L898).
  - Mobile: struttura 2 righe:
    - ROW 1: [Badge WIN/DRAW/LOSS] + [Punteggio X-Y] + [Badge CI +/-]
    - ROW 2: [data dd/MM] + [Ruolo] + [Gol X] + [Assist Y]
  - Applicare gap espliciti, padding uniforme, icone fixed-size + shrink-0, valori nowrap dove serve.
  - Desktop mantenere stile esistente o layout equivalente che funzioni.
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rubric` TR-8.1: Leggibilità card a 390px e 430px. Scale 1-5; anchors come AC-6; threshold >=4. Evidence: screenshot.
  - `rule` TR-8.2: Nessun testo viene troncato con truncate aggressivo (dati Ruolo/Gol/Assist/data visibili). Evidence: ispezione markup.
- **Notes**: Solo layout interno, non cambiare stile colori/bordi.

## Task 9: Mobile UX - Match Detail Progressi Partita (<=430px)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Modificare [matches/[id]/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/matches/%5Bid%5D/page.tsx#L205-L236) sezione "Progressi partita".
  - Su <=430px (breakpoint):
    - RIGA 1 (grid-cols-2): XP Guadagnati | Career Index
    - RIGA 2 (col-span-full / full-width): CI Before → After
  - Valori CI Before/After in linea singola non spezzata.
  - Padding e gap uniformi.
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `rubric` TR-9.1: Leggibilità a 390/430px. Scale 1-5; anchors come AC-7; threshold >=4. Evidence: screenshot.
  - `rule` TR-9.2: "CI Before → After" non spezza testo su 3 righe. Evidence: markup + screenshot.
- **Notes**: Desktop può restare a 3 colonne o usare stesso layout responsive.

## Task 10: Match List Card - Rimuovere piccolo lucchetto
- **Status**: `pending`
- **Priority**: low
- **Depends On**: None
- **Description**:
  - Modificare [matches/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/matches/page.tsx): trovare l'icona Lock piccola in basso a destra nella card della partita (oltre la riga ~200, leggere resto file per identificarla).
  - Rimuovere solo quell'icona e il suo wrapper.
  - Lasciare intatta la sezione "Stato partita" nel dettaglio partita con Lock.
  - Backend immutabilità partita non toccato.
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `rule` TR-10.1: In matches list card markup non c'è componente <Lock />. Evidence: grep file + screenshot lista.
  - `rule` TR-10.2: In match detail "Stato partita" Lock ancora presente. Evidence: grep + screenshot detail.
- **Notes**: Leggere parte restante matches/page.tsx prima di modificare.

## Task 11: Allineamento generale Cards - padding, gap, vertical alignment
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Audit delle cards in: Dashboard (KPI 2x2, metriche V/P/S/CI/Streak), Profile (StatCard 4-up, achievements grid), Stats (top 4 metriche), Matches detail.
  - Uniformare:
    - Padding interno: standard `p-4 / md:p-5` o equivalente. Evitare px-3 py-5 vs p-5 casuali sulla stessa griglia.
    - Radius: mantenere `rounded-xl` o `rounded-2xl` coerente per la stessa famiglia.
    - Icon containers: `w-* h-*` fissi (es w-10 h-10), `shrink-0`, flex items-center justify-center.
    - Gap: usare classi `gap-*` esplicite invece di margini casuali.
    - Griglie con `auto-rows-fr` o min-height coerente per card in riga.
    - Valori importanti `whitespace-nowrap` o `tabular-nums`.
    - `min-w-0` per testo che non deve espandere griglie flex.
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rubric` TR-11.1: Coerenza visuale cards. Scale 1-5; anchors come AC-10; threshold >=4. Evidence: screenshot confronto + review classi Tailwind.
- **Notes**: Cambi minimali e mirati, non redesign.

## Task 12: Comandi Build e Typecheck
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1-11 completati
- **Description**:
  - Eseguire `npx tsc --noEmit`. Risolvere eventuali errori di tipo introdotti.
  - Eseguire `next build`. Risolvere eventuali errori di build.
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-12.1: `npx tsc --noEmit` exit code 0. Evidence: output terminale.
  - `rule` TR-12.2: `next build` exit code 0. Evidence: output terminale.
- **Notes**: Fixare solo errori introdotti dalle modifiche. Non refactor.

## Task 13: Report Finale e verifica integrità
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1-12 completati
- **Description**:
  - Compilare il report finale strutturato dell'utente (10 punti):
    1. Causa reale bug Primo Passo
    2. Causa reale bug 2 stagioni
    3. Come è stato corretto il Trophy Engine
    4. Risultati reconciliation/dry-run
    5. Cosa cambiato FREE/PRO
    6. Quali CTA duplicate rimosse
    7. Principali fix mobile
    8. Risultato test Trophy
    9. tsc risultato
    10. build risultato
  - Conferma esplicita: **NESSUN push, NESSUN deploy effettuato**.
  - Elencare eventuali PlayerAchievement sospetti (sbloccati ma non validi) se trovati.
- **Acceptance Criteria Addressed**: Tutti gli AC, in fase di Review finale.
- **Test Requirements**:
  - `rule` TR-13.1: Report contiene tutte le 10 voci richieste e la dicitura "nessun push/deploy".
  - `rubric` TR-13.2: Chiarezza e onestà del report. Scale 1-5; 1=vago, 3=accettabile, 5=preciso con evidenze; threshold >=4.
- **Notes**: Report sintetico, non papiro.
