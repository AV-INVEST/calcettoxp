# CalcettoXP — Trophy System V2 — Product Requirements Document

## Overview
- **Summary**: Completa trasformazione del sistema Trofei (ex Achievement) in una Trophy Collection stile videogioco, con catalogo canonico di 50 trofei (20 FREE + 30 PRO), motore di valutazione scalabile, UI premium "wow", sistemi Share+Referral tracciati, partite immutabili e coerenza FREE/PRO.
- **Purpose**: Elevare la sezione Trofei a feature distintiva di CalcettoXP, aumentare engagement tramite collezionismo/prestigio, introdurre growth loop Share+Referral, fissare bug 0/0 e rendere architettura scalabile per anni.
- **Target Users**: Giocatori CalcettoXP FREE e PRO, mobile-first (390/430px) con fallback desktop.

## Goals
1. Sistema Trofei con source of truth unico e 50 trofei canonici (20 FREE, 30 PRO).
2. Motore di valutazione scalabile `evaluateAchievementProgress` con aggregati lifetime, streak, CI, LV, XP, stagioni, share, referral, ruolo.
3. Pagina `/achievements` ridisegnata in stile Trophy Collection premium gaming: hero, prossimo/ultimo trofeo, categorie 10.
4. Share tracciato server-side (1 max/utente/giorno anti-farming) + Referral con `referralCode` stabile.
5. Storico stagioni PRO in Profilo e blocco stagionale PRO in Stats con linguaggio premium locked.
6. Partite IMMUTABILI (niente edit UI/API) + Date picker min=-72h max=now.
7. Fix bug 0/0, rinomina UI "Achievement→Trofei", gestione legacy ON_FIRE.
8. Mobile 390/430 perfetto, no overflow, no double box, layout corretto.

## Non-Goals
- NON modificare formule XP, CI, OVR, ranking, level thresholds.
- NON modificare Stripe pricing, auth Google, PlayerCard FREE, multiplayer.
- NON toccare date/format delle stagioni, formato 26/27.
- NON aggiungere altri trofei oltre ai 50 specificati.
- NON eseguire deploy/push. LOCALE ONLY.
- NON eseguire reset/drop/truncate/delete massivi sul DB.
- NON creare documentazione README.md o .md extra oltre agli artifact spec.

## Background & Context
- Stato attuale: `/achievements` può mostrare 0/0 perché Achievement e PlayerAchievement non sono sincronizzati con un catalogo canonico.
- `src/lib/achievements.ts`: definisce un set hardcoded di 22 key legacy e un checker post-match.
- `Achievement` e `PlayerAchievement` esistono in Prisma ma NON sono la source of truth (mancano dal seed, count non predicibile).
- `ON_FIRE` legacy: descrizione vecchia ≠ logica win streak 5 (nuovi V2: INARRESTABILE=10 win streaks, MACCHINA PERFETTA=15).
- Share: `ShareCardButton.tsx` usa Web Share + Copy, ma NESSUN tracking server-side.
- Referral: NESSUN modello/tracciamento esistente in schema Prisma.
- Match: PATCH `/api/matches/[id]` esiste e permette edit entro 15min + "nessuna partita successiva".
- Date validation server: già esiste (futuro + 72h). UI picker attualmente non vincola min/max.
- Tema design esistente: palette PRO Vault (#080907, #D4AF37, #F2D27A), verde neon CalcettoXP, obsidian/graphite.

## Functional Requirements

### FR-1: Achievement Catalog Source of Truth
- Creare `src/lib/achievement-catalog.ts` come UNICA definizione canonica dei 50 trofei.
- Ogni trofeo ha: key stabile, nome, descrizione, tier (FREE/PRO), categoria, requirement/target, eventuale ruolo, ordine visuale, metadata icona.
- Script/helper SAFE IDEMPOTENTE per sync DB: crea record `Achievement` mancanti, non modifica quelli esistenti, NON cancella.
- Vecchi achievement legacy non inclusi nei 50: mantenuti in `Achievement` table ma ESCLUSI dalla collection V2 UI.

### FR-2: 20 Trofei FREE esatti
1-20 come specificati: Primo Passo, Prima Vittoria, Primo Contributo, Mostra la Card, Passaparola, Primo Compagno, Spogliatoio, Ci Sto Prendendo Gusto (5pt), Appassionato (10), Presenza Fissa (25), Calciatore Navetta (50), Vincitore Nato (10v), Mentalità Vincente (25v), Muro Difensivo (5 unbeaten), In Crescita (LV10), Affermato (LV25), Giocatore di Serie (CI≥1200), Top Player (CI≥1500), Specialista I, Specialista II.

### FR-3: 30 Trofei PRO esatti
21-50 come specificati: Community Builder (5ref), Capitano (10ref), Talent Scout (25ref), Ambasciatore (50share), Veterano (75pt), Centenario (100pt), Instancabile (150pt), Stagionato (250pt), Gladiatore (500pt MAX), Campione (50v), Dominatore (100v), Serial Winner (150v), Re del Campo (250v), Invincibile (10 unbeaten), Inarrestabile (10 win streaks), Imbattibile (20 unbeaten), Macchina Perfetta (15 win streaks), Fuoriclasse (CI≥1600), Elite (CI≥1800), World Class (CI≥2000), Fenomeno (CI≥2200), Leggenda Vivente (LV50), Oltre il Livello (75k XP), Eterno (100k XP), Specialista III, Specialista IV, Maestro del Ruolo, Secondo Capitolo (2 stagioni), Veterano delle Stagioni (3), Una Vita sul Campo (5).

### FR-4: Specialisti ruolo (multi-path)
- Specialista I/II/III/IV + Maestro: stesso achievement sbloccabile da QUALSIASI percorso ruolo (ATT/CEN/DIF/POR).
- Backend: unlock se ALMENO UN percorso soddisfa requisito.
- UI FREE sbloccato: mostra prioritariamente il percorso COERENTE col ruolo primario del giocatore.
- Target:
  - I: ATT10 / CEN10 / DIF10(≤1) / POR5cs
  - II: ATT25 / CEN25 / DIF25(≤1) / POR10cs
  - III: ATT50 / CEN50 / DIF50(≤1) / POR25cs
  - IV: ATT100 / CEN100 / DIF100(≤1) / POR50cs
  - Maestro: ATT250 / CEN250 / DIF200(≤1) / POR100cs

### FR-5: Progressione LIFETIME
- Tutti i trofei usano conteggi LIFETIME (non resettano a fine stagione): partite, vittorie, gol, assist, clean sheet, XP, share, referral.
- Solo trofei 48-49-50 (stagioni) contano il numero di stagioni distinte con ≥1 partita.
- I PlayerProfile aggregati esistenti (`matchesPlayed` etc.) sono la fonte principale.

### FR-6: PRO non pay-to-win
- Nessun trofeo assegna reward XP / CI / OVR / ranking advantage.
- Progresso trofei PRO tracciato anche mentre utente è FREE: mostra 100/100 COMPLETATO ma stato locked (gold).
- Alla conferma PRO (webhook Stripe checkout.session.completed o subscription active): reconciliation retroattiva SAFE che unlocka tutti i PRO completati ma locked.

### FR-7: Share tracciato server-side
- **Share valido**: Web Share completato (promise risolta senza AbortError) OR copy share link completato (fallback).
- Chiamata API dedicata (es. `/api/share/track`) con auth + idempotenza per utente/giorno.
- Anti-farming: MAX 1 share valido/day per utente ai fini trofei.
- NON dichiarare WhatsApp/gruppi/amici nel copy (non verificabili).
- Link condiviso: `/p/<username>?ref=<referralCode>` (vedi FR-8).

### FR-8: Referral system
- `referralCode`: campo UNICO stabile su PlayerProfile (non dipende da username). Generato a onboarding.
- Link referral pubblico: `/p/<username>?ref=<referralCode>` (parametro ref nel query string).
- Storage: `Referral` model Prisma (additive migration): id, referrerId, referredId, createdAt, status(pending/confirmed).
- Persistenza del ref: al click del link pubblico → salva ref in cookie/session.
- Referral valido SOLO se: nuovo account, onboarding completato, non self-referral, stesso referredId una volta sola, un solo referrer.
- Trofei referral: FREE#6(1) FREE#7(3) + PRO#21(5) PRO#22(10) PRO#23(25).

### FR-9: Fix 0/0 + Rename UI
- Catalogo sempre restituisce 50 totali, 20 FREE, 30 PRO.
- Nuovo account: 0/50 · FREE 0/20 · PRO 0/30.
- UI: "Achievement" → "Trofei"; "Achievement sbloccati" → "Trofei sbloccati".
- Model DB `Achievement`/`PlayerAchievement` NON rinominato (rischioso).

### FR-10: Trophy Page Redesign
- `/achievements` diventa "TROPHY COLLECTION" / "BACHECA TROFEI".
- Mood: gaming premium, obsidian/graphite, verde neon + gold/champagne PRO, profondità, metallic highlights, glow controllato.
- NO dashboard admin, NO box tutti uguali, NO grigio piatto.
- Hero: TITOLO "TROFEI" + `X/50 sbloccati` + progress ring/bar premium + FREE X/20 (verde) + PRO X/30 (gold) + "COMPLETAMENTO CARRIERA XX%".
- "PROSSIMO TROFEO": non sbloccato con progresso REALE più vicino al target. Nome + icona + progresso + "Te ne mancano X".
- "ULTIMO SBLOCCATO": nome, icona, data, glow verde/gold.
- 10 Categorie: INIZIO CARRIERA / SOCIAL-COMMUNITY / PARTITE / VITTORIE / SERIE / CAREER INDEX / LIVELLO-XP / SPECIALISTA / STAGIONI / PRESTIGE PRO.
- Ogni categoria: titolo, X/Y, mini progress, lista card.

### FR-11: Trophy Card design
- FREE UNLOCKED: graphite + medaglione forte + bordo verde neon sottile + soft green glow + check discreto + data + "SBLOCCATO" + shimmer/glow lentissimo (prefers-reduced-motion).
- FREE LOCKED: dark matte + icona attenuata + frost leggero + piccolo lock + nome + requisito + progresso reale + thin bar.
- PRO OBSIDIAN/GOLD: gold champagne + bronze leggero + ivory text + border/glow gold + medaglione metallico + crown discreta + badge PRO GOLD + shimmer oro lento.
- FREE user vede PRO: solo piccolo lock, NIENTE "LOCKED" rosso, requisito/progresso visibile, se completato mostra "COMPLETATO · DISPONIBILE CON PRO".
- Card: 1 colonna mobile (390/430), ≥2 colonne sm/desktop. NO truncate nomi. Touch ≥44px.

### FR-12: Dashboard/Profile Layout Fix (box/centering)
- OVR/CI/LV Profilo: 3 card INDIPENDENTI, stesse dimensioni, centratura reale, NESSUN box esterno visibile.
- Streak/Settimana/Stagione/Miglior CI Dashboard: 2x2, stessa altezza, flex-col, items-center, justify-center, text-center, padding/min-height se serve.
- Partite/Vittorie/Gol/Assist: stesso principio.
- NO `overflow-x: hidden` globale. Fix width/grid/flex alla radice.
- NO wrapper con border/background/radius che contiene altri 3/4 box visibili.

### FR-13: Profilo — Storico Stagioni Premium
- FREE: storico stagioni rifatto con stile premium locked: obsidian/black, gold border, lock gold, crown, badge PRO, testo chiaro, preview/censor elegante, CTA upgrade.
- PRO: storico VERO, stesso stile premium ma contenuto reale.
- Attuale "Mostra solo stagione corrente · Passa a PRO" troppo sterile.

### FR-14: Stats — Coerenza PRO
- Per FREE: il blocco advanced/stagionale PRO usa lo STESSO linguaggio premium locked del Profilo (NON mostra falsa "ATTIVA" con dati stale).
- Per PRO: dati reali aggiornati.
- Statistiche base FREE già previste: NON bloccate.

### FR-15: Partite Immutabili
- UI: rimuovi matita edit, CTA modifica, link edit in lista e dettaglio partita.
- SERVER: PATCH `/api/matches/[id]` → disabilita in modo sicuro (ritorna 403 sempre). Non rimuovere endpoint se non serve (non c'è delete), ma rendi inutilizzabile.
- Se esiste DELETE: NON toccarlo in questa task, ma segnalarlo nel report.
- Match `lockedAt`: comportamento invariato ma UI non mostra più possibilità di edit.

### FR-16: Date Match 72h (UI)
- `RegisterMatchForm`: date picker input `min` = now-72h, `max` = now.
- Client validation (UX) + server validation (sicurezza, GIA' esistente).
- Timezone browser: calcola min/max in locale, poi trasforma in ISO per API.

### FR-17: Achievement Engine
- Refactor `evaluateAchievementProgress(profile, matches, opts)` in file dedicato.
- Supporta: lifetime count, streak (win/unbeaten), CI threshold, level threshold, XP lifetime, stagioni distinte, share count, referral count, role-specific aggregates (ATT gol, CEN assist, DIF partite≤1 subito, POR cs).
- Dopo match POST: valuta achievement rilevanti e salva nuovi unlock (include anche PRO completed ma locked).
- Post-match screen: nuovi trofei mostrati (FREE=verde/neon, PRO=gold se utente PRO, altrimenti "COMPLETATO·PRO").

### FR-18: Legacy ON_FIRE + compatibilità
- `ON_FIRE` vecchia key (win streak=5): NON cancellata. Per V2:
  - Utenti che hanno ON_FIRE unlocked: mappato come milestone, ma INARRESTABILE (10) e MACCHINA PERFETTA (15) sono i nuovi unlocker streak win.
  - ON_FIRE: esclusa dalla V2 UI (non tra i 50). Mantenuta in DB. Nessun write during render.

## Non-Functional Requirements
- **NFR-1**: Mobile-first. Verifica visuale su 390px e 430px: nessun overflow-x, nomi non troncati, touch ≥44px, box non appiccicati.
- **NFR-2**: No librerie pesanti extra. Tailwind + Lucide esistenti + pseudo-elements + gradient.
- **NFR-3**: Transition 150-300ms, shimmer lento, `prefers-reduced-motion` respect everywhere.
- **NFR-4**: Prisma migrations ADDITIVE ONLY. No ALTER DROP column su modelli esistenti se non è risk-free.
- **NFR-5**: No DB write during render. Tutte le operazioni di sync/unlock via API routes / server actions / webhook.
- **NFR-6**: `tsc --noEmit` passa.
- **NFR-7**: `next build` passa (distingui errore env DATABASE_URL da errore Next).

## Constraints
- **Technical**:
  - Stack: Next.js 14 App Router, Prisma PostgreSQL, Auth.js, Stripe, Tailwind, Lucide.
  - NO modify XP/CI/OVR/ranking/level formulas.
  - NO modify PlayerCard FREE, Stripe pricing, auth Google, multiplayer, season dates.
  - NO overflow-x-hidden globale.
  - NO drop/reset/truncate/delete massivi.
- **Business**:
  - PRO non pay-to-win: nessun vantaggio numerico.
  - 50 trofei ESATTI: 20 FREE + 30 PRO.
- **Dependencies**:
  - Prisma schema additive changes → migration SQL.
  - Backfill script SAFE IDEMPOTENTE separato.

## Assumptions
- Il `PlayerProfile.matchesPlayed / wins / goals / assists / cleanSheets / level / xp / careerIndex` sono consistenti e rappresentano il lifetime (base di tutti i calcoli).
- Il numero di clean sheet per DIF non è disponibile come aggregato; si calcola da storico Match ruolo=DIF + goalsAgainst ≤1.
- Il conteggio share validi e referral validi non è presente: si aggiungono modelli nuovi.
- `subscriptionStatus === ACTIVE` o `TRIALING` implica PRO attivo (vedi `hasActivePro` attuale).

## Open Questions
- [ ] Il vecchio `Match.lockedAt` a 15min viene mantenuto (non più usato dalla UI ma non dannoso). OK lasciare invariato? → **Assunzione SI, lascia invariato.**

---

## Acceptance Criteria

### AC-1: Catalogo 50 trofei canonico
- **Type**: `rule`
- **Given**: File `src/lib/achievement-catalog.ts` e sync helper SAFE
- **When**: si conta il catalogo
- **Then**: 50 totali · 20 FREE · 30 PRO · key stabili · categorie 10 come da specifica
- **Pass Condition**: `catalog.length === 50`, `free === 20`, `pro === 30`, tutte le key specificate presenti
- **Evidence**: Conteggio da unit-test o console.log manuale + ispezione file

### AC-2: Account nuovo mostra 0/50 · FREE 0/20 · PRO 0/30
- **Type**: `rule`
- **Given**: Utente senza PlayerAchievement
- **When**: pagina `/achievements` e sezione trofei profilo
- **Then**: 0/50, FREE 0/20, PRO 0/30, nessun 0/0, nessun —/0
- **Pass Condition**: Conteggi UI corrispondono al catalogo
- **Evidence**: Screenshot o ispezione React render

### AC-3: Unlock FREE base dopo 1 partita
- **Type**: `rule`
- **Given**: Nuovo utente, registrata 1 partita WIN
- **When**: valutazione achievement dopo il match
- **Then**: sbloccati PRIMO PASSO + PRIMA VITTORIA + (se gol/assist/cs/rigore parato → PRIMO CONTRIBUTO)
- **Pass Condition**: PlayerAchievement creati con unlockedAt
- **Evidence**: Record DB o response API post-match

### AC-4: Specialista ruolo (ATT) — 10 gol
- **Type**: `rule`
- **Given**: Giocatore ruolo ATT con 9 gol lifetime
- **When**: registra partita con 1 gol (totale 10)
- **Then**: SPECIALISTA_I sbloccato FREE
- **Pass Condition**: unlockedAt popolato per key SPECIALIST_I
- **Evidence**: DB PlayerAchievement per SPECIALIST_I

### AC-5: PRO tracciato mentre FREE
- **Type**: `rule`
- **Given**: Utente FREE, 100 partite lifetime
- **When**: si valuta CENTENARIO (PRO#26, 100pt)
- **Then**: PlayerAchievement progress=100, progressTarget=100, unlockedAt=NULL, stato "COMPLETATO · DISPONIBILE CON PRO" in UI
- **Pass Condition**: unlockedAt è null ma progress === target; UI mostra stato corretto
- **Evidence**: DB + UI screenshot

### AC-6: Referral valido → unlock PRIMO COMPAGNO (FREE#6)
- **Type**: `rule`
- **Given**: Utente A genera refCode; Utente B nuovo, apre `/p/A?ref=codeA`, signup, completa onboarding
- **When**: verifica Referral confirmed e achievement evaluation
- **Then**: Referral A→B confermato; Utente A ha FREE#6 sbloccato; self-referral rifiutato; doppio referral rifiutato
- **Pass Condition**: DB Referral + PlayerAchievement FREE#6
- **Evidence**: DB record + API response

### AC-7: Share valido tracciato, secondo share stesso giorno NO incremento
- **Type**: `rule`
- **Given**: Utente oggi 0 share
- **When**: share 1 valido → count++; share 2 stesso giorno → count invariato
- **Then**: ShareCount giornaliero = 1, trofei MOSTRA LA CARD (1) e PASSAPAROLA aspetta 5 giorni distinti
- **Pass Condition**: ShareRecord unica per (userId, date)
- **Evidence**: DB ShareRecord + achievement progress

### AC-8: Partite IMMUTABILI — UI e Server
- **Type**: `rule`
- **Given**: Una partita registrata da <15min (modificabile nel vecchio sistema)
- **When**: si cerca matita/CTA modifica in lista/dettaglio; si tenta PATCH `/api/matches/[id]`
- **Then**: UI nessun elemento edit visibile; API risponde 403
- **Pass Condition**: Nessun Pencil/Edit button in DOM; PATCH ritorna status 403
- **Evidence**: Screenshot UI + curl/fetch response

### AC-9: Date picker min=-72h max=now
- **Type**: `rule`
- **Given**: Form registra partita
- **When**: input date[type=datetime-local]
- **Then**: min = now-72h browser locale, max = now browser locale
- **Pass Condition**: HTML attributes `min` e `max` corretti, preventDefault di invalid input
- **Evidence**: DevTools ispezione elemento + tentativo selezione data fuori range

### AC-10: Legacy ON_FIRE gestito senza perdita dati
- **Type**: `rule`
- **Given**: Utente legacy con ON_FIRE unlockato
- **When**: mostra V2 Trophy Collection
- **Then**: ON_FIRE non tra i 50 (non in V2 UI); record PlayerAchievement esistenti NON cancellati; INARRESTABILE e MACCHINA PERFETTA sono indipendenti
- **Pass Condition**: catalog V2 non include ON_FIRE key; DB non modificato su legacy
- **Evidence**: Catalogo keys + DB snapshot

### AC-11: Storico Stagioni Profilo premium locked (FREE)
- **Type**: `rule`
- **Given**: FREE user con ≥2 stagioni
- **When**: pagina `/profile` sezione Storico Stagioni
- **Then**: stile premium obsidian/gold, lock gold, crown/badge PRO, preview censor elegante, CTA upgrade; non "LOCKED LOCKED" in rosso
- **Pass Condition**: Visuale premium locked non "rottamente disabilitato"
- **Evidence**: Screenshot 390px + 430px

### AC-12: Stats sezione PRO FREE non mostra falsa ATTIVA stale
- **Type**: `rule`
- **Given**: FREE user
- **When**: pagina `/stats` blocco stagione PRO
- **Then**: linguaggio uguale a sezione premium locked profilo; nessun badge "ATTIVA" con dati stale/free limitato
- **Pass Condition**: Blocco PRO stile locked uniforme con profilo
- **Evidence**: Screenshot confronto stats/profilo FREE user

### AC-13: Mobile 390/430 — nessun overflow-x, card 1 colonna, nomi non troncati
- **Type**: `rule`
- **Given**: Viewport 390px e 430px
- **When**: si naviga `/achievements`, `/profile`, `/stats`, `/matches`, `/dashboard`
- **Then**: nessun horizontal scroll; trophy cards 1 colonna; nomi trofei/labels non troncati; no double box
- **Pass Condition**: `document.documentElement.scrollWidth === clientWidth` in tutte le pagine; visual ispezione
- **Evidence**: Browser DevTools responsive + screenshot

### AC-14: No overflow-x-hidden globale, layout fixato a radice
- **Type**: `rule`
- **Given**: `src/app/globals.css` + tutti i layout wrapper
- **When**: ricerca `overflow-x: hidden` su html/body/wrapper globali
- **Then**: nessuna occorrenza (o giustificata e non usata per nascondere layout rotto)
- **Pass Condition**: Grep restituisce 0 occorrenze o solo casi locali leciti
- **Evidence**: `Grep pattern="overflow-x:\s*hidden"` output

### AC-15: tsc + next build passano
- **Type**: `rule`
- **Given**: codice modificato
- **When**: `npx tsc --noEmit` e `npx next build`
- **Then**: exit code 0 (se fallisce per DATABASE_URL mancante, distinto da errore Next)
- **Pass Condition**: typecheck zero errors; next build zero errori di compilazione
- **Evidence**: Terminal output tsc + next build

### AC-16: WOW Trophy Page — qualità visuale premium
- **Type**: `rubric`
- **Dimension**: Impatto visivo / stile Trophy Collection gaming
- **Scale**: 1-5
- **Anchors**: 1 = sembra dashboard admin di box grigi; 3 = migliorato ma ancora "box dentro box"; 5 = collezione trofei videogioco con profondità, glow controllato, metallico, differenza netta FREE/PRO, shimmer, mistero
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot mobile+desktop della pagina intera

### AC-17: Coerenza FREE/PRO + non pay-to-win
- **Type**: `rubric`
- **Dimension**: Chiarezza del contratto FREE/PRO e assenza pay-to-win
- **Scale**: 1-5
- **Anchors**: 1 = PRO sblocca dati/bonus XP/CI; 3 = PRO sblocca trofei ma non si capisce; 5 = PRO chiaramente collezione/prestigio, 0 reward numerici, progresso tracciato da FREE visibile
- **Pass Threshold**: >= 4
- **Evidence**: Analisi codice + UI confronto FREE/PRO

### AC-18: Architettura scalabile
- **Type**: `rubric`
- **Dimension**: Modularità e estendibilità del sistema V2
- **Scale**: 1-5
- **Anchors**: 1 = logica hardcoded sparsa in 10 file; 3 = centralizzato ma monolitico; 5 = catalogo TS puro + evaluator puro + sync idempotente separato + clear boundary UI/engine
- **Pass Threshold**: >= 4
- **Evidence**: Code review file struttura (catalog, engine, sync, page)
