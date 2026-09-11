# Spec: Card Architecture + UX Overhaul (CalcettoXP)

## Problema & Contesto
CalcettoXP presenta ridondanze architetturali e logiche che ne appiattiscono la gerarchia prodotto:
- Bottom nav "Statistiche" è in concorrenza con Profilo e Dashboard senza ruolo proprio.
- Player Card va in 99 dopo 1 singola partita (Impact/Results/Scoring) per mancanza di calibrazione sul sample size.
- `careerIndexChange` viene renderizzato con il simbolo `%` (es. `+22.0%`), ma il dato è un delta CI assoluto (es. `+22 CI`), non una percentuale.
- Le streaks attive (`computeActiveStreaks`) si interrompono dopo il primo match e non possono mai essere >1.
- Badge "PRO" testuali ridondanti su sezioni già caratterizzate da design gold/obsidian + corona + lock.
- Possibili CTA PRO multiple per pagina, contro la regola "max 1 CTA forte per pagina".

Obiettivo: ridare gerarchia chiara, premium, "videogioco", mobile-first (390/430px), **senza toccare formule XP/CI/OVR, Trophy System, Stripe, Auth, Match immutabilità e season logic**.

## Utenti & Obiettivi
- Utente FREE e PRO authenticated.
- Visitatore non autenticato che vede landing CTA.
- Obiettivi utente: capire a colpo d'occhio CHI sono (Profilo), COSA ho giocato (Partite), COSA ho conquistato (Trofei), COME sto evolvendo (Card).

## Non-Goali (Hard Constraints)
- ❌ Cambiare formule XP, Career Index, suo clamp, OVR mapping, role contribution CI, max XP match.
- ❌ Cambiare Trophy requirements e reconciliation.
- ❌ Cambiare Stripe prices, subscription backend, Google auth.
- ❌ Toccare privacy profilo, match validation, immutabilità match, regola 72h, season dates.
- ❌ Rifare il sito da zero.
- ❌ Refactor URL aggressivo (no cambio route `/dashboard`; solo redirect `/stats` → `/dashboard`).
- ❌ Modifiche DB, migration, backfill, push/deploy.

## Requisiti Funzionali

### FR-1 | Bottom Nav definitiva: PROFILO | PARTITE | + | TROFEI | CARD
- `navItems` di `MobileBottomNav.tsx` diventano 4 link + button centrale.
- Sostituire la voce `Statistiche` (icona BarChart2/BarChart3) con: icona `IdCard` (Lucide), label `Card`, href `/dashboard`.
- Ordine finale: `/profile` (Profilo), `/matches` (Partite), [FAB: /matches/new], `/achievements` (Trofei), `/dashboard` (Card).
- Active state verde elettrico coerente su `/dashboard`.
- Nessuna emoji.

### FR-2 | Home CTA logged-in: "LA MIA CARD"
- In `src/app/page.tsx` lo SmartCTA con `loggedInLabel="VAI ALLA DASHBOARD"` diventa `loggedInLabel="LA MIA CARD"`.
- Icona card/tessera (es. `IdCard`).
- Micro animazione premium leggera (glow/shimmer periodico tipo breathing glow). No bounce/casinò.

### FR-3 | Gerarchia 4 sezioni (invarianti contenuto)
- **PROFILO = CHI SEI**: avatar, username/nick, paese/città, ruolo/piede, edit, piano FREE/PRO, riepilogo carriera BASE (partite, V/P/S, gol, assist, clean sheet, win rate), preview trofei + link, storico stagioni / storico PRO. NO analytics.
- **PARTITE = COSA HAI GIOCATO**: lista, dettaglio, stagione corrente / storico con gating attuale. NO stats aggregate duplicate.
- **TROFEI = COSA HAI CONQUISTATO**: bacheca completa autonoma. NO intere sezioni trofei duplicate altrove.
- **CARD = COME STAI EVOLVENDO**: Player Card protagonista, share, OVR/CI/LV + XP, CI andamento, forma/streak, ultime partite compatte, record personali, stagione corrente compatta, analytics PRO, prossimo obiettivo compatto.

### FR-4 | Elimina "/stats" come destinazione e integra il valore unico in Card
- Route `/stats` deve fare **redirect server-side 301/308 sicuro a `/dashboard`** (middleware o route redirect Next.js).
- Integrare in Card (dashboard) solo gli elementi di `/stats` con valore unico e non ridondante:
  - Career Index chart (già presente, ma conferma gating 20 FREE / full PRO).
  - Period stats 7/30/90 giorni (PRO).
  - Statistiche per ruolo (PRO).
  - Record personali (vedi FR-11; gating FREE/PRO invariato).
  - Andamento stagioni / confronto stagioni PRO (dove meglio collocati: nello storico Profilo).
- **NON** riportare nella Card Partite/Gol/WinRate/Career Index come 4 box se già presenti in forma migliore altrove (Profilo o sezione OVR/CI/LV).

### FR-5 | Ordine UX Card (Dashboard) — narrativa CARD → crescita → performance → record → premium
1. Player Card protagonista.
2. Condividi la mia Card.
3. OVR / CI / LV + progresso XP.
4. Career Index / evoluzione (grafico).
5. Forma attuale: 4 box 2x2 (Streak · Settimana · Stagione · Miglior CI), stessa altezza/padding/contenuto otticamente centrato.
6. Ultime partite compatte.
7. Record personali (sezione dedicata, non dentro stats generiche).
8. Stagione corrente compatta.
9. Analytics PRO + upsell premium (max 1 CTA forte).
10. Prossimo obiettivo / trofeo compatto.
L'ordine può essere leggermente aggiustato se il codice suggerisce una gerarchia migliore. Principio: card → crescita → performance → record → premium.

### FR-6 | Card Attributes: sample size confidence smoothing (NO 99 dopo 1 partita)
- File: `src/lib/card-attributes.ts`.
- Conservare le formule RAW di merito sportivo.
- Aggiungere un layer di **confidence/smoothing** prima del clamp finale 0..99, basato su `matchesPlayed`.
- Baseline neutra indicativa 50.
- Formula suggerita (da adattare per ogni attributo):
  ```
  confidence = min(1, matchesPlayed / 15)
  display = clampInt( baseline + (raw - baseline) * confidence , 0, 99)
  ```
- **Attributo EXPERIENCE**: è già progressivo per natura (partite/livello). NON applicare lo smoothing se distorce la sua semantica; valutare a parte.
- **Attributo CONSISTENCY**: con 0-1 partita non abbiamo evidenza → mantenere neutra/calibrata.
- **Valori-obiettivo qualitativi**: dopo 1 partita eccellente (WIN+2 gol+1assist) Impact/Results/Scoring devono stare circa **50–65**, NON tre 99.
- OVR deve rimanere **identico** (non usa questo file).

### FR-7 | Fix Streak Attive (`computeActiveStreaks` in retention.ts)
- I match sono ordinati `playedAt desc` (dal più recente al più vecchio).
- **Win streak**: incrementa solo su WIN consecutive; DRAW o LOSS la interrompono.
- **Unbeaten**: incrementa su WIN e DRAW; LOSS interrompe.
- **Loss streak**: incrementa solo su LOSS consecutive; WIN/DRAW interrompono.
- Bug attuale: c'è un `break` prematuro dopo la prima iterazione; la funzione deve proseguire finché la regola lo consente.
- UI:
  - `winStreak === 1` → mostra `1` + copy "1 vittoria" (no `>=2` threshold).
  - `winStreak >= 2` → "X vittorie".
  - `unbeaten >= 1` da mostrare quando winStreak è 0 ma unbeaten esiste.
  - `0` → `—` + "Inizia la striscia" (o "Costruisci la striscia" mantenendo copy coerente).
- Allineare la logica con `calcStreaks` di `achievement-engine.ts` che già funziona correttamente per le streaks trofeo; o estrarre utility condivisa per assicurare stessa regola, oppure testare entrambi.
- **NON rompere i trophy streak**.

### FR-8 | Fix Career Index Change rendering (no più `+22.0%`)
- Audit e sostituzione in:
  - `src/components/player/PlayerCard.tsx` (riga ~631, simbolo `%` appeso a careerIndexChange).
  - `src/components/dashboard/DashboardCardStage.tsx` (riga ~418, LockedProCardPreview, stesso pattern).
  - Ogni altro rendering dove `careerIndexChange` ottiene `%`.
- Preferenza UI: mostrare `+22 CI` oppure semplicemente `+22` (senza %).
- Se si vuole davvero una %, calcolarla sul CI precedente (`%` calcolata, non appesa al delta). Questa spec consiglia `+22 CI` per semplicità e semantica corretta.
- **NON cambiare il Career Index nel DB e la formula CI**.

### FR-9 | Premium design: rimuovere badge PRO decorativi ridondanti
Principio: premium elegante = meno etichette, più design (corona, lock, bordo oro, fondo ossidiana, glow).
- Mantenere PRO scritto **solo** dove serve a identificare entitlement/piano:
  - Badge account/piano utente realmente informativo.
  - CTA `PASSA A PRO` / `Sblocca PRO` finali.
- Rimuovere badge PRO decorativi dove il contesto è già chiarissimo (es. card dorata + corona + lock già bastano):
  - Preview storico bloccata nel Profilo.
  - Card "Storico completo · Tutte le stagioni" dorata.
  - Altri box dorati/ossidiana già con corona e lock.
- Specifici punti da valutare per rimozione badge decorativi:
  - `src/app/profile/page.tsx`: badge PRO sulle card di anteprima stagione lockata se già c'è lock + corona.
  - `src/components/dashboard/DashboardCardStage.tsx`: LockedProCardPreview top bar "PRO · Anteprima" (si valuta se tenere solo corona+lock + "Anteprima").

### FR-10 | Max 1 CTA PRO forte per pagina
- **Card (Dashboard)**: mantenere il grande box premium "Passa a PRO per statistiche avanzate" con corona grande, lista benefici, CTA gialla. Questo è l'upsell principale. NON aggiungere altre CTA PRO giganti prima/dopo.
- **Profilo**: una sola CTA forte per storico/abbonamento è sufficiente.
- **Trofei**: lo stato locked/completed-but-locked è linguaggio sufficiente. NON trasformare ogni trophy PRO in una CTA.

### FR-11 | Record Personali nella Card (Dashboard)
- Spostare/integrare la sezione "Record personali" (oggi in `/stats` e in `PersonalRecordsCard`) nella nuova Card/Dashboard.
- Record realmente motivanti (senso ruolo-aware, non rumore):
  - Miglior Career Index (già esistente FREE).
  - Miglior incremento CI in singola partita.
  - Più gol in una partita.
  - Più assist in una partita.
  - Miglior win streak (all time).
  - Miglior unbeaten streak (all time).
  - Clean sheet record per POR (solo per ruolo POR; altrimenti nascondere per non produrre rumore).
- Gating FREE/PRO invariato: FREE vede i record FREE; PRO vede anche quelli PRO.

### FR-12 | 4 Box forma (Streak · Settimana · Stagione · Miglior CI) — coerenza visuale 2x2 mobile
- Stessa altezza (`min-h-[120px]` e `auto-rows-fr` già quasi ok; uniformare).
- Stesso padding (px/py coerenti).
- Contenuti centrati otticamente; stessa distanza sopra/sotto.
- Icone fixed-size + `shrink-0`.
- Nessun testo vicino ai bordi.
- **Streak** usa logica corretta di FR-7.
- **Stagione** = numero di partite nella stagione corrente.
- **Settimana** = numero partite questa settimana.
- **Miglior CI** = vero best CI (stesso `getBestCareerIndex`, invariato).

### FR-13 | Mobile design/allineamento (390px / 430px)
- Tutte le card: padding interno coerente, aria top/bottom uguale.
- Icone Lucide/SVG: fixed-size + `shrink-0`.
- Nessuna emoji che sbilancia baseline.
- Testi mai contro i bordi; usare `min-w-0`, wrapping controllato.
- Valori importanti `whitespace-nowrap`.
- NO global `overflow-x:hidden` per mascherare problemi.
- Card della stessa famiglia con `min-height` / padding coerenti.
- **NO** testo apparentemente decentrato perché icona altera il layout.

### FR-14 | FREE / PRO gating invariato
- FREE vede: Player Card base, OVR/CI/LV/XP, stats base carriera, CI recente limitato (20 punti), partite stagione corrente, trofei FREE, progress trofei PRO locked, share card, record FREE.
- PRO vede: CI storico completo, analytics 7/30/90, stats per ruolo, record/streak avanzati PRO, storico stagioni completo, confronto stagioni, temi premium.
- **NON** rendere FREE accidentalmente una feature PRO e viceversa.

### FR-15 | Compatibilità link / routing
- Bottom nav: Profilo→/profile, Partite→/matches, +→/matches/new, Trofei→/achievements, Card→/dashboard.
- Home logged-in CTA → /dashboard.
- `/stats` → redirect a `/dashboard` (308 server-side o middleware). Nessun link morto.
- Active state bottom nav su `/dashboard` → Card attiva (verde elettrico).
- Metadata e titolo visibile Dashboard: non più "Dashboard". Titolo: `La mia Card` (o alternativa elegante equivalente).

### FR-16 | Link audit interno a /dashboard e /stats
- Trovare e aggiornare eventuali interni a `/stats` puntandoli a `/dashboard` (per es. testi "Vai alle statistiche", link, label).
- Il redirect di /stats è safety net, ma i link vanno sistemati.

## Requisiti Non Funzionali
- **Mobile-first**: test visivo/tipo su 390px e 430px (NO overflow-x orizzontale, NO overlap, NO testo a bordo, NO CTA tagliata).
- **Zero regressioni desktop** (funzionali; visualmente senza peggioramenti sostanziali).
- **TypeScript pulito**: `npx tsc --noEmit` deve passare.
- **Build**: `npx next build` deve passare.
- **Zero scritture DB**, zero migration, zero backfill.

---

## Acceptance Criteria

### Rule AC-1 (Bottom Nav)
La `MobileBottomNav` presenta 5 elementi nella sequenza Profilo | Partite | + | Trofei | Card, con Card che punta a `/dashboard` e usa icona `IdCard` e label `Card`. Active state verde elettrico attivo quando pathname inizia per `/dashboard`.

### Rule AC-2 (Home CTA logged-in)
Nella landing page, SmartCTA mostra `LA MIA CARD` quando l'utente è autenticato e onboarding completato; icona IdCard (o equivalente card/tessera); micro animazione glow/shimmer non invasiva; click porta a `/dashboard`.

### Rule AC-3 (Ridondanza contenuti)
Profilo NON contiene analytics avanzate duplicate della Card. Partite NON contiene stats aggregate duplicate. Trofei rimane pagina autonoma. Card/Dashboard è la pagina con narrativa "evoluzione carriera".

### Rule AC-4 (Stats integrazione e redirect)
Visita `/stats` → redirect a `/dashboard` (301/308). I link interni a `/stats` sono aggiornati a `/dashboard`. La Card include record personali e analytics PRO dalle stats senza duplicare Partite/Gol/WinRate già in Profilo/sezione OVR/CI/LV.

### Rule AC-5 (Card — Ordine sezioni)
Nella Card/Dashboard il flusso approssimativo è: Player Card → Share → OVR/CI/LV → CI chart → 4 box forma → Ultime partite → Record → Stagione corrente → Analytics PRO + CTA → Prossimo obiettivo. Max 1 CTA PRO forte per pagina.

### Rubric AC-6 (Card attributes sample size smoothing)
Scale: 0 (nessuna calibrazione, 99 dopo 1 partita) / 1 (calibrazione parziale ma valori ancora ~85 dopo 1 partita) / 2 (calibrazione corretta). Passo con threshold ≥ 2.
Con evidenza: valori per i casi di test (0, 1, 3, 5, 10, 15+ match) con vittoria mostruosa (2G/1A) mostrano progressione graduale (1 match: 50-65 ca.), 15+: prossimo a raw. OVR invariato.

### Rule AC-7 (Streak retention corretta)
- [W] → win=1, unbeaten=1
- [W,W] → win=2
- [W,W,D] (recent→old) → win=2, unbeaten=3
- [D,W,W] → win=0, unbeaten=3
- [L,W,W] → win=0, unbeaten=0
- [W×6,L] → win=6
- [W×6,L,W] → win=1 (la più recente LOSS interrompe, la W dopo è nuova da 1)
- UI: winStreak=1 → mostra `1` e copy tipo "1 vittoria".
- Trofei streak: engine trophy non regredisce (testati indipendentemente se esiste suite).

### Rule AC-8 (CI delta rendering)
Nessun punto del codice appende `%` a `careerIndexChange` a meno che non si tratti di una percentuale davvero calcolata (es. `(delta/prev)*100`). Il rendering preferito è `+22 CI` o `+22`. Esempio: 1000→1022 deve mostrare `+22 CI`, NON `+22.0%`.

### Rule AC-9 (Badge PRO ridondanza)
Su box già caratterizzati da design gold/ossidiana + corona + lock, badge "PRO" decorativi sono rimossi. Badge PRO informativi (piano utente, CTA finale) sono conservati.

### Rule AC-10 (CTA PRO max 1 per pagina)
Nella Card/Dashboard esiste UNA sola CTA PRO forte (box grande con lista benefici + CTA gialla). In Profilo una sola CTA forte. I trofei PRO usano stato locked/completed-but-locked come UI, non CTA giganti.

### Rule AC-11 (Record personali in Card)
Card/Dashboard include una sezione "Record personali" con almeno: miglior CI, miglior +CI partita, più gol partita, più assist partita, miglior win streak, miglior unbeaten streak. Gating FREE/PRO invariato.

### Rule AC-12 (4 box forma coerenza)
I 4 box (Streak, Settimana, Stagione, Miglior CI) su griglia 2x2 mobile hanno stessa altezza, padding, centrattura ottica e icone fixed-size. Nessun testo a contatto con i bordi.

### Rule AC-13 (Mobile QA: 390px e 430px)
A 390px e 430px: NO horizontal overflow, NO overlap, NO testo contro bordo, NO CTA tagliata, NO box schiacciati. Verifica di: nuova bottom nav, Player Card, attributi card, OVR/CI/LV, 4 box, CI chart, ultime partite, record, analytics card.

### Rule AC-14 (FREE/PRO gating invariato)
Check dei confini: utente FREE non vede analytics 7/30/90, stats per ruolo, record PRO, storico completo PRO. Utente PRO li vede. Nessun dato PRO leak a FREE.

### Rule AC-15 (Link + redirect)
- Bottom nav routing corrisponde a FR-1 e FR-15.
- `/stats` redirect a `/dashboard`.
- Active state "Card" su `/dashboard`.
- Metadata Dashboard non riporta "Dashboard": titolo/heading è "La mia Card" o equivalente.

### Rule AC-16 (tsc e build)
- `npx tsc --noEmit` ritorna exit 0.
- `npx next build` ritorna exit 0.

## Dipendenze & Assunzioni
- Prisma schema e DB già pronti (nessuna migration necessaria).
- Lucide icons include `IdCard` (già usata ampiamente; fallback: `CreditCard` o icona simile).
- `/stats` è visitabile da link vecchi/bookmark, quindi il redirect è safety-net obbligatorio.
- Il calcolo degli OVR NON transita per `card-attributes.ts` (confermato da codebase exploration: OVR viene da `playerProfile.overall`).

## Domande Aperte (risolte con assunzioni, da confermare se diverso)
- Q: Dove collocare "andamento stagioni / confronto stagioni" attualmente in Stats? A: Come da FR-3 restano nello storico Profilo (già c'è sezione "Storico completo"). Nessun ulteriore spostamento per ora.
- Q: Glow CTA home: intensità? A: breathing glow leggero, approccio CSS con keyframes opacità/box-shadow, 3s cycle. Se troppo invadente, ridurre.
- Q: CI delta label: `+22` vs `+22 CI`? A: Spec favorisce `+22 CI` per non ambiguità; implementatore può scegliere in base alla spaziatura disponibile, ma MAI col `%`.
