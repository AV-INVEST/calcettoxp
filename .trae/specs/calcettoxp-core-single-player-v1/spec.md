# Spec: CALCETTOXP — CORE SINGLE PLAYER V1

## Problema

La parte autenticata di CalcettoXP (dashboard, registrazione partita, post-partita, progressione) non comunica sufficientemente valore e progressione. Manca un'esperienza premium "wow" attorno alla Player Card, alla barra XP cumulativa, alle evoluzioni di status, ai momenti gratificanti post-partita e alla distinzione percepibile FREE vs PRO senza pay-to-win.

## Utenti e obiettivi

- **Utente FREE**: vuole percepire progressione concreta (LV, XP, CI, OVR, streaks, achievement) dalla prima partita; vuole vedere la card evolvere visivamente; vuole capire cosa ottiene PRO senza essere infastidito.
- **Utente PRO**: vuole profondità analitica e personalizzazione estetica senza vantaggi competitivi su XP/CI/OVR/ranking.
- **Prodotto**: singolo giocatore = partita autodichiarata; multiplayer verrà dopo.

## Obiettivi

1. Ridisegnare la dashboard come centro spettacolare della carriera (Player Card protagonista + OVR + CI + LV + barra XP cumulativa + streak + prossimo traguardo + ultime partite + CTA Registra Partita).
2. Solidificare la curva XP/LV: LV 1–50 (LV50 = max), helper unico per soglie/progresso/XP mancanti, barra XP cumulativa verso prossimo livello.
3. Evoluzione visiva FREE della Player Card per status (NOVIZIO → EMERGENTE → AFFERMATO → VETERANO → LEGGENDA) in base al livello; PRO aggiunge solo temi/personalizzazione.
4. Registrazione partita semplice ~20–30s: punteggio squadra/avversari → WIN/DRAW/LOSS auto-derivato + validazioni server-side (72h max, max 2 al giorno, min 2h tra partite, no futuro, no gol giocatore > gol squadra, no negativi, no duplicati evidenti).
5. `MatchResultScreen` come momento più gratificante: sequenza animata (risultato → XP → barra XP cumulativa animata → CI OLD/NEW → OVR → LEVEL UP → achievement → prossimo traguardo), con LEVEL UP e NUOVO STATUS come reveal premium.
6. Retention reale: streaks di risultati (non login), prossimo achievement, prossimo milestone, partite settimana, record personali, miglior CI, progresso LV.
7. FREE vs PRO percepibile: FREE completo; PRO = storico completo, analytics 7/30/90, statistiche per ruolo/periodo, record avanzati, temi card PRO, achievement PRO; teaser eleganti non invasivi + CTA `SCOPRI PRO`.
8. Coerenza dati canoniche: LV max 50, OVR da CI solo, CI delta ∈ [-20, +40], XP max partita 150, risultato coerente col punteggio, nessun LV75 attivo.
9. Responsive 390px / 430px / desktop, animazioni brevi e premium con `prefers-reduced-motion`, nessun overflow o testi troncati.

## Non-goal

- Qualsiasi logica multiplayer (verifiche, conferme, team, rankings condivisi): fuori scope.
- Landing, pricing, SEO, Stripe, auth flow.
- Modifica formule Career Index o OVR canoniche.
- Prestige/LV51+.
- Pay-to-win in qualsiasi forma (PRO non tocca XP, CI, OVR, ranking).
- Refactor non necessario fuori scope.
- Migrazioni Prisma distruttive o push non sicure.

## Requisiti funzionali (FR)

### FR-1 Dashboard core "effetto wow"

La pagina [dashboard/page.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/dashboard/page.tsx) deve mostrare, dall'alto in basso e in ordine di priorità visiva:

1. **Player Card protagonista**, grande, evidenziata, con status FREE (vedi FR-3) e PRO badge se attivo.
2. **OVR** ben visibile (già nella card).
3. **Career Index + ultima variazione delta** (dentro/fuori card, visibile).
4. **Livello attuale** (dentro card e in un blocco dedicato con progresso).
5. **Barra XP REALE cumulativa verso prossimo livello**, con:
   - XP attuale sulla soglia corrente
   - soglia prossimo livello
   - XP mancanti al prossimo LV
   - percentuale progresso
6. **CTA primaria evidente**: `REGISTRA PARTITA`.

In modo compatto e premium, mostrare anche:

- Prossimo traguardo (milestone/achievement più vicino)
- Streak attuale reale (win streak + unbeaten streak, derivati da partite reali ordinate cronologicamente)
- Partite questa settimana (ISO week / lun–dom sulla base della data playedAt)
- Stagione corrente (da `seasons.ts`, già presente)
- Record personale / miglior Career Index quando disponibile (da `records.ts`)
- Ultime partite (minimo ultime 5, con risultato, data, gol/ass, CI delta)

**Must**: layout compatto, non infinito; leggibile in 3–6 scroll.
**Must**: stile dark + neon CalcettoXP, sport/eSports premium, microanimazioni pulite.

### FR-2 XP + Livelli (LV 1–50)

- File helper unico per XP/LV in [xp-levels.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/xp-levels.ts):
  - `getLevelProgress(xp)` → `{ currentLevel, currentThreshold, nextThreshold, xpInCurrentLevel, xpToNextLevel, progressPct }`
  - la barra XP mostrata è **sempre** progresso CUMULATIVO tra soglia corrente e soglia prossimo livello (non `xpEarned/150`)
  - LV massimo = 50. Se il giocatore supera la soglia LV50 rimane LV50, progresso 100%, nessun LV51.
- Curva invariata ma soglie limiate a 50 livelli. Rimuovere/disattivare riferimenti attivi a LV75 in [next-goal.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/next-goal.ts) (es. milestone `lv75` non ammissibile).
- XP per partita rimangono canoniche: +50 base, +30 win, +15 draw, +5/gol, +5/assist, +15 clean sheet POR, cap 150.
- Tutti i milestone di LV fino a LV50 FREE. Nessuna progressione LV esclusiva PRO.

Visualizzazione esempio (dashboard e post-partita):

```
LV 7
1.520 / 1.750 XP
██████████░░ 66%
230 XP al LV 8
```

### FR-3 Evoluzione visiva Player Card (FREE)

Base del livello, prima dei temi PRO:

| Range LV | Status     |
| -------- | ---------- |
| 1–4      | NOVIZIO    |
| 5–14     | EMERGENTE  |
| 15–29    | AFFERMATO  |
| 30–49    | VETERANO   |
| 50       | LEGGENDA   |

- La [PlayerCard.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/player/PlayerCard.tsx) deve:
  - ricevere `level` e derivare internamente lo status.
  - mostrare un badge di status (es. "NOVIZIO", "EMERGENTE") ben visibile.
  - evolvere progressivamente bordi, glow, intensità corner decorations, eventuale sottotitolo/linea glow secondo lo status.
  - questa evoluzione è **FREE e sempre visibile**.
- Temi PRO esistenti (CLASSIC/NIGHT/ELITE/NEON) restano gating PRO come personalizzazione aggiuntiva.
- **Non** applicare vantaggi di valori/statistiche per estetica.

### FR-4 Registrazione partita

Rivedere [RegisterMatchForm.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/matches/RegisterMatchForm.tsx) e [api/matches/route.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/app/api/matches/route.ts).

**Form**:

- data + ora partita (`datetime-local`)
- Punteggio: gol squadra (`goalsFor`) + gol avversari (`goalsAgainst`)
- **Rimuovere i bottoni WIN/DRAW/LOSS manuali**: il risultato deriva automaticamente dal punteggio (client anteprima + server conferma).
- Ruolo (POR/DIF/CEN/ATT)
- Tuoi gol
- Tuoi assist
- Clean sheet solo se POR E `goalsAgainst === 0` (forzato a false altrimenti).
- Note opzionali 250 max
- Pulsante conferma

**Validazioni SERVER-SIDE (mandatorie, con messaggi in italiano chiari)**:

1. No partita futura.
2. Registrabile entro **72 ore** (non 24) da `playedAt`.
3. **Max 2 partite per giorno** (non 3) dello stesso giocatore (stesso `startOfDay` UTC).
4. **Almeno 2 ore** tra la `playedAt` di due partite dello stesso giocatore.
5. Duplicati evidenti: stessa data/ora + stesso ruolo + stesso punteggio + stesso giocatore = blocco con messaggio dedicato.
6. Gol giocatore (`goals`) non > gol squadra (`goalsFor`).
7. Valori negativi impossibili bloccati da schema Zod.
8. Risultato auto-derivato coerente: WIN sse `goalsFor > goalsAgainst`, DRAW sse `==`, LOSS sse `<`; qualsiasi disallineamento client viene sovrascritto server-side.

Messaggi d'errore: chiari, in italiano, es. "Puoi registrare massimo 2 partite al giorno", "Devono passare almeno 2 ore tra una partita e l'altra", ecc.

Nessun limite settimanale.
`isVerified=false` e `verificationType=SELF_REPORTED` invariati.

### FR-5 Post-partita: momento più importante

Rivedere [MatchResultScreen.tsx](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/components/matches/MatchResultScreen.tsx).

Sequenza animata breve (timing a scelta ma leggibile ~3–5s):

1. **RISULTATO** + score + ruolo + gol/assist.
2. **XP guadagnati** (count up).
3. **Barra XP cumulativa**: partire dal valore PRIMA della partita e animarsi al valore DOPO. Se c'è level-up, la barra deve riempire il livello vecchio, poi resettarsi e riempire parzialmente il nuovo (animazione visibile).
4. **Career Index OLD → NEW** (+/- delta).
5. **OVR OLD → NEW** se cambia.
6. Eventuale **LEVEL UP**: reveal premium con `LEVEL UP LV N → LV N+1`.
7. Se cambia status card (es. NOVIZIO→EMERGENTE): reveal `NUOVO STATUS: AFFERMATO` + anteprima della card col nuovo status.
8. Eventuali achievement sbloccati.
9. Progresso prossimo traguardo (da `next-goal.ts`).

Anche per la sconfitta: enfatizzare XP e progresso carriera; CI perso ma non come punizione totale.

**CTA finale primaria**: `TORNA ALLA DASHBOARD`.
**NON** mettere una CTA grossa "Registra un'altra" come primaria (può esistere secondaria ma non incentivare spam).

Rispettare `prefers-reduced-motion`: se attivo, salta animazioni progressive, mostra risultato finale.

### FR-6 Retention reale

- No login streak giornaliero.
- Streaks derivano **solo dai risultati delle partite** ordinate per `playedAt` crescente:
  - `currentWinStreak`: ultime consecutive WIN dalla più recente all'indietro, si spezza a DRAW o LOSS.
  - `currentUnbeatenStreak`: ultime consecutive WIN|DRAW, si spezza a LOSS.
- Mostrare streaks dove appropriato (dashboard, in un modulo compatto).
- Mostrare "partite questa settimana" (lun–dom corrente, ISO week compatibile).
- "Prossimo achievement" e "prossimo milestone" da `NextGoalModule` esistente (e da achievements).
- Record personali: già da `records.ts`; mostrare quelli FREE + teaser PRO per gli altri.
- Miglior Career Index (personal best CI).

### FR-7 FREE vs PRO — valore percepito

FREE è completo:

- Registrazione partite
- XP/LV 1–50
- Career Index, OVR
- Evoluzione base status Player Card (FR-3)
- Statistiche essenziali, stagione corrente
- Ultimi 20 punti CI (come ora)
- Achievement FREE + milestone FREE
- Progressione LV

PRO = profondità + personalizzazione:

- Storico completo CI (non solo ultimi 20)
- Storico completo stagioni (da `PlayerSeason`)
- Analytics 7/30/90 giorni (se i dati ci sono)
- Statistiche per ruolo/periodo
- Record e streak avanzate (quelli già marcati PRO in `records.ts`)
- Confronto stagioni (solo se dati sufficienti, altrimenti "ancora nessun dato")
- Temi card NIGHT / ELITE / NEON (CLASSIC rimane FREE default)
- Achievement PRO

**Teaser eleganti, non invasivi nella dashboard FREE**:

- Preview temi NIGHT / ELITE / NEON con icona 🔒 (solo card piccole/icone, non popup)
- "Analisi forma 7/30/90g" 🔒
- "Storico completo" 🔒
- "Record avanzati" 🔒

CTA discreta: `SCOPRI PRO` (link a `/pricing`).
Nessun popup aggressivo.
Se non ci sono abbastanza dati per una feature PRO dichiararlo ("Serve più cronologia partite").

### FR-8 Coerenza dati

Controlli e correzioni:

1. LV massimo = 50, anche se `levelThresholds` dovesse avere di più: clamp.
2. Rimuovere milestone/achievement attivi per LV75. ([next-goal.ts](file:///c:/Users/viva_/Desktop/CALCETTOXP/src/lib/next-goal.ts) milestone `lv75` va rimosso o reso inattivo per tutti).
3. OVR deriva SOLO da Career Index (già in `ovr.ts`, confermare nessun altro assegnamento).
4. CI delta sempre ∈ [-20, +40] (già clamp in `career-index.ts`, confermare).
5. XP max partita = 150 (già clamp in `xp-levels.ts`, confermare).
6. PRO non modifica progressione competitiva (XP/CI/OVR/ranking) — controllare/assicurarsi che `entitlements.ts` non tocchi formule.
7. Risultato sempre e solo derivato da punteggio sul server (FR-4).
8. Statistiche sempre derivate da dati reali (nessun numero inventato).

### FR-9 Responsive / Qualità

- Mobile 390px e 430px: nessun overflow orizzontale; test visuale a quelle larghezze.
- Desktop: layout curato, non "stretch" eccessivo.
- Animazioni fluide, brevi, premium.
- Rispettare `prefers-reduced-motion` in: `MatchResultScreen`, qualsiasi count-up, qualsiasi animazione barra XP, reveal level-up/status.
- Riutilizzare componenti esistenti (`Card`, `Button`, `Badge`, `Progress`, `PlayerCard`, `NextGoalModule`, ecc.).
- Evitare modifiche Prisma se non necessarie. Se serve migration (es. nuovi campi): SQL sicuro, UTF-8 senza BOM/NUL, MAI reset/drop/force.

## Requisiti non funzionali (NFR)

- NFR-1: **Niente pay-to-win** (vincolo hard, regola del progetto).
- NFR-2: TypeScript pulito: `npx tsc --noEmit` deve passare dopo ogni task.
- NFR-3: Nessun commit/deploy finché non completato e approvato.
- NFR-4: Codice e commenti tecnici in inglese; UI e messaggi d'errore in italiano.
- NFR-5: Nessun refactor non necessario fuori scope.
- NFR-6: Build locale (se possibile) a fine implementazione; se env/auth bloccano, dichiararlo.

## Dipendenze e assunzioni

- Prisma schema già adeguato per Match, PlayerProfile, CareerIndexHistory, PlayerSeason, Achievement. Nessuna migration necessaria assunta; se ne serve una, va dichiarata e sicura.
- Stripe/auth fuori scope, quindi le feature PRO sono solo gating UI/logico lato client/server.
- `isVerified=false` sempre per partite single player.
- `next-auth`, `@prisma/client`, `zod`, `lucide-react`, `date-fns` già disponibili.

## Open questions

Nessuna. Decisioni assunte per coerenza con il testo del task e le regole del progetto.

---

## Criteri di Accettazione (AC)

**Tutti di tipo `rule` a meno di `rubric` esplicito.**

### Gruppo Dashboard (FR-1, FR-6, FR-7)

- **AC-D1 (rule)**: PlayerCard è il primo elemento prominente in dashboard; contiene OVR, LV badge, status FREE, CI + delta, attributi.
- **AC-D2 (rule)**: È presente un blocco XP/LV che mostra `LV N / XP corrente / soglia prossimo LV / XP mancanti / percentuale` con barra cumulativa.
- **AC-D3 (rule)**: CTA `REGISTRA PARTITA` è visibile in prima posizione (sotto card o sticky mobile-friendly) e link a `/matches/new`.
- **AC-D4 (rule)**: Sono mostrati: prossimo traguardo, streak win/imbattibilità corrente, partite settimana, stagione corrente, miglior CI (se >1000 o altrimenti il valore corrente), ultime 5 partite.
- **AC-D5 (rule)**: FREE mostra 4 teaser PRO eleganti (temi, analisi 7/30/90, storico completo, record avanzati) + CTA `SCOPRI PRO` → `/pricing`. PRO rimuove i lock e mostra il contenuto o "dati insufficienti" al bisogno.
- **AC-D6 (rubric)**: Impatto visivo "effetto wow", dark+neon premium, niente casino. Scala: 0–2; soglia ≥ 1.5.

### Gruppo XP/LV (FR-2, FR-8)

- **AC-XP1 (rule)**: Esportato helper in `xp-levels.ts` con firma `getLevelProgress(xp: number) -> { currentLevel, currentThreshold, nextThreshold, xpInCurrentLevel, xpToNextLevel, progressPct }`.
- **AC-XP2 (rule)**: `currentLevel` max = 50 per ogni `xp`; oltre soglia LV50, `currentLevel=50` e `progressPct=100`.
- **AC-XP3 (rule)**: La barra XP in dashboard e in post-partita usa il progresso cumulativo `(xpInCurrentLevel / (nextThreshold - currentThreshold)) * 100` e non `xpEarned/150`.
- **AC-XP4 (rule)**: Milestone `lv75` in `next-goal.ts` rimosso o non più selezionabile da `pickNextGoal` sia per FREE che per PRO.

### Gruppo Evoluzione Player Card (FR-3)

- **AC-PC1 (rule)**: Status derivato da LV secondo tabella NOVIZIO/EMERGENTE/AFFERMATO/VETERANO/LEGGENDA; visibile come badge nella PlayerCard.
- **AC-PC2 (rule)**: Bordo, glow, corner decorations evolvono visivamente in intensità per status (es. LEGGENDA ha glow maggiore di NOVIZIO).
- **AC-PC3 (rule)**: Evoluzione status è visibile a FREE; temi NIGHT/ELITE/NEON restano bloccati a FREE e richiedono PRO (gate in `canCustomizeCard` o equivalente in render).

### Gruppo Registrazione Partita (FR-4, FR-8)

- **AC-M1 (rule)**: Form senza bottoni WIN/DRAW/LOSS; risultato è derivato e mostrato in anteprima da `goalsFor` vs `goalsAgainst`.
- **AC-M2 (rule)**: Server calcola `result` da punteggio, ignora qualsiasi campo client.
- **AC-M3 (rule)**: 72h di finestra, no futuro, max 2/giorno, min 2h tra partite, no duplicati (stesso `playedAt` + ruolo + punteggio), gol giocatore ≤ gol squadra; ogni caso restituisce errore HTTP 400 con messaggio italiano specifico.
- **AC-M4 (rule)**: Clean Sheet disponibile solo a POR e forzato false se `goalsAgainst > 0`; client aggiorna UI accordingly.
- **AC-M5 (rule)**: XP max partita 150 ancora cap; CI delta ancora in [-20, +40].

### Gruppo Post-partita (FR-5, FR-2, FR-3)

- **AC-R1 (rule)**: Sequenza fase-animata risultato → XP → CI → OVR → level-up → achievement.
- **AC-R2 (rule)**: Barra XP cumulativa animata dal valore PRE-match al valore POST-match; in caso di level-up, mostra riempimento LV vecchio + reset e riempimento parziale LV nuovo.
- **AC-R3 (rule)**: LEVEL UP reveal se `newLevel > oldLevel`; NUOVO STATUS reveal se la classe status è cambiata dopo la partita.
- **AC-R4 (rule)**: CTA primaria `TORNA ALLA DASHBOARD`; "Registra un'altra" è solo opzione secondaria o assente.
- **AC-R5 (rule)**: Con `prefers-reduced-motion: reduce` il componente mostra finale senza animazioni progressive.

### Gruppo Retention (FR-6, FR-8)

- **AC-RET1 (rule)**: `currentWinStreak` e `currentUnbeatenStreak` sono calcolati da partite ordinate per data crescente, spezzandosi correttamente.
- **AC-RET2 (rule)**: `matchesThisWeek` = partite con `playedAt` nella settimana ISO corrente (lun–dom).

### Gruppo FREE vs PRO (FR-7, NFR-1)

- **AC-FP1 (rule)**: FREE vede evoluzione status card e LV50 senza alcun lock.
- **AC-FP2 (rule)**: FREE vede teaser PRO (4 moduli) + CTA `SCOPRI PRO` senza popup.
- **AC-FP3 (rule)**: PRO vede sbloccati: storico CI completo (non limitato a 20), analytics 7/30/90 (o "dati insufficienti"), record avanzati da `records.ts`, temi NIGHT/ELITE/NEON selezionabili.
- **AC-FP4 (rule)**: Nessuna formula XP/CI/OVR differenzia FREE vs PRO (verifica statica: `xp-levels.ts`, `career-index.ts`, `ovr.ts` non leggono entitlement).

### Gruppo Qualità (FR-9, NFR-2)

- **AC-Q1 (rule)**: `npx tsc --noEmit` passa (zero errori).
- **AC-Q2 (rule)**: Nessun testo troncato o overflow orizzontale a 390px e 430px larghezza viewport (verifica manuale o ispezione classi Tailwind se test browser non disponibile).
- **AC-Q3 (rule)**: `prefers-reduced-motion` rispettato in almeno `MatchResultScreen`, count-up XP/CI, barra XP animata.
- **AC-Q4 (rubric)**: Qualità responsive mobile/desktop. Scala 0–2; soglia ≥ 1.5.
