# Tasks: CalcettoXP Landing Page Revamp

Map from spec AC → implementation work. Ogni task ha Test Requirements (TR) locali di tipo `rule` o `rubric` per autoverifica.

Dipendenze: I task sono ordinati in modo che i task precedenti preparino il terreno per i successivi. Possiamo parallelizzare dove non ci sono dipendenze dirette sullo stesso file.

---

## Task 1: CTA Auth-Aware Component (SmartCTA) + legal-config date dinamiche

**File modificati:**
- `src/lib/legal-config.ts` — sostituisci `lastUpdated`, `lastUpdatedHuman` hardcodati con logica data dinamica (new Date() con formatter italiano).
- `src/components/layout/AppFooter.tsx` — sostituisci `year = 2026` hardcodato con `new Date().getFullYear()`.
- Crea nuovo file `src/components/cta/SmartCTA.tsx` — componente client-side riutilizzabile che gestisce la logica CTA primaria:
  - Stato auth (useSession)
  - Check onboarding (fetch GET `/api/onboarding/status`)
  - Varianti: `primary`, `secondary`, `ghost`, `yearly-gold`
  - Label: prop custom
  - Icon: prop custom (lucide)
  - Loading states con Loader2
  - Routing: guest → `/api/auth/signin?callbackUrl=${encodeURI(path || '/')}`; logged-in + no onboarding → `/onboarding`; logged-in + onboarding done → `/dashboard`

**Priorità:** high

**Dipendenze:** nessuna (setup base)

**Test Requirements (TR):**
- **TR-1a (rule):** `legal-config.ts` — nessuna stringa hardcoded '2026-09-09' o '9 settembre 2026'; `lastUpdated` e `lastUpdatedHuman` calcolati da `new Date()` con formattazione italiana.
- **TR-1b (rule):** `AppFooter.tsx` — `year` usa `new Date().getFullYear()` o equivalente dinamico.
- **TR-1c (rule):** `SmartCTA.tsx` — esporta un componente che accetta `variant`, `size`, `label`, `icon`, `callbackPath`; usa `useSession` e `useEffect`/fetch per `/api/onboarding/status`; implementa il comportamento corretto per i 3 stati (guest, logged-in no-onboarding, logged-in onboarding).
- **TR-1d (rule):** SmartCTA per utenti logged-out: onClick → `signIn("google", { callbackUrl })` oppure `router.push("/api/auth/signin?...")` con callback URL appropriato.
- **TR-1e (rubric):** Qualità codice SmartCTA (0-2, soglia ≥1):
  - 0: Codice spaghetti, errori TS
  - 1: Pulito, tipato, stati loading/error gestiti
  - 2: Modulare, flessibile, ready per riuso in più punti

---

## Task 2: Landing page — Header + Hero section completi con CTA corretti + miglior copy

**File modificati:**
- `src/app/page.tsx` — riscrivi HEADER e HERO section:
  - Header: logo + SmartCTA a destra ("Accedi" / "Vai alla dashboard")
  - Hero badge: "NUOVA STAGIONE 2026" → migliorato con glow/pulse
  - Hero headline + sub-headline copy migliorato (più aspirante)
  - Primary CTA: usa SmartCTA variant="primary" con label "CREA LA TUA CARRIERA GRATIS" o "INIZIA ORA"
  - Secondary CTA: smooth scroll nativo a #come-funziona (non router)
  - DemoPlayerCard migliorato visivamente (glow, gradient, bordi)
  - MiniCIIndex migliorato (glow verde, gradient card)

**Priorità:** high

**Dipendenze:** Task 1 (SmartCTA)

**Test Requirements (TR):**
- **TR-2a (rule):** Nessun `href="#"` in header o hero.
- **TR-2b (rule):** Header contiene logo + CTA action visibile. Guest: label contiene "Accedi" o "Inizia". Logged-in: label contiene "Dashboard" o equivalente.
- **TR-2c (rule):** Secondary CTA "SCOPRI COME FUNZIONA" ha href="#come-funziona" o onClick scroll a elemento con id="come-funziona".
- **TR-2d (rule):** Primary CTA usa SmartCTA (o la stessa logica equivalente inline) e non è un `<a>` statico a `#pricing`.
- **TR-2e (rubric):** Impatto visivo hero (0-2, soglia ≥1):
  - 0: Stesso look di prima
  - 1: Migliorato, glow verde, pattern pitch più visibili, card mockup più premium
  - 2: Hero davvero "wow", neon glow bilanciato, tipografia forte, mockup card giocatore d'impatto

---

## Task 3: Landing page — How-it-works, Card Evolution, Solo/Multiplayer Modes migliorati

**File modificati:**
- `src/app/page.tsx` — sezione #come-funziona, card evolution, modes:
  - 3 step Gioca/Registra/Evolvi con copy migliorato
  - Card design: hover glow, numeri step 01/02/03 più prominenti
  - Card evolution: 4 tappe, frecce/animazione di progressione più spettacolare, labels migliorate
  - Solo Career: CTA usa SmartCTA (non link statico a #pricing)
  - Multiplayer: aspirante, badge "IN ARRIVO" più curato

**Priorità:** medium

**Dipendenze:** Task 1 (SmartCTA per CTA solo career)

**Test Requirements (TR):**
- **TR-3a (rule):** CTA "INIZIA ORA" nella sezione Solo Career è un componente SmartCTA o equivalente auth-aware; NON è un `<a href="#pricing">`.
- **TR-3b (rule):** How-it-works ha id="come-funziona" (target dello smooth scroll della secondary CTA dell'hero).
- **TR-3c (rule):** Nessun link morto in queste 3 sezioni.
- **TR-3d (rubric):** Coinvolgimento visivo sezioni (0-2, soglia ≥1):
  - 0: Stesse card piatte di prima
  - 1: Hover effects, glow, pattern campo più evidenti
  - 2: Ogni step racconta una storia, card evolution suggerisce davvero progressione

---

## Task 4: Landing page — 4 Demo Giocatori switchabili con grafici non lineari

**File modificati:**
- `src/app/page.tsx` — riscrivi sezione demo carriera:
  - 4 giocatori demo (Andrea ATT, Federico CEN, Riccardo DIF, Marco POR)
  - Tabs/pulsanti per switchare
  - Statistiche diverse per ruolo (es. portiere: clean sheet, parate; attaccante: gol, hat-trick)
  - 4 dataset Career Index con ALMENO 1 discesa ciascuno (non solo linee in salita)
  - Grafico Recharts AreaChart mantenuto ma dati diversi per ogni giocatore

**Priorità:** high

**Dipendenze:** nessuna (sezione indipendente)

**Test Requirements (TR):**
- **TR-4a (rule):** Array di ≥4 giocatori, ognuno con ruolo distinto (ATT/CEN/DIF/POR).
- **TR-4b (rule):** Ogni dataset grafico ha ≥1 punto dove v diminuisce rispetto al punto precedente (verifica array per ogni giocatore: almeno un `data[i].v > data[i+1].v`).
- **TR-4c (rule):** UI permette di switchare tra i giocatori (stato React locale).
- **TR-4d (rubric):** Chiarezza e interesse grafico (0-2, soglia ≥1):
  - 0: Grafico poco chiaro su mobile, nomi poco leggibili
  - 1: Leggibile, switch funziona, statistiche per ruolo appropriate
  - 2: Ogni giocatore ha personalità visiva, suggerisce carriera diversa, grafico racconta una storia (vittorie/sconfitte)

---

## Task 5: Landing page — Achievement sezione (≥12, multi-ruolo, copy "molti altri")

**File modificati:**
- `src/app/page.tsx` — sezione achievements:
  - Array ≥12 achievement
  - Copertura ruoli: es. Portiere (Clean Sheet, Rigore parato, Muro), Difensore (Muro difensivo, Imbattuto), Centrocampista (Regista, Assist King), Attaccante (Hat-trick, Bomber), Trasversali (Prima partita, On Fire, Ironman, Centurion, 1500 Club...)
  - Icona appropriata per ogni categoria
  - Copy footer sezione: "E molti altri obiettivi da sbloccare..." o equivalente
  - Layout grid migliorato, possibile categorizzazione per rarità (es. badge raro/comune/epico come varianti colore)

**Priorità:** medium

**Dipendenze:** nessuna (sezione indipendente)

**Test Requirements (TR):**
- **TR-5a (rule):** Array achievements.length ≥ 12.
- **TR-5b (rule):** Almeno 1 achievement esplicito per ogni ruolo (portiere, difensore, centrocampista, attaccante).
- **TR-5c (rule):** Testo "molti altri da sbloccare" o equivalente italiano è presente dopo la griglia (verifica stringa in file).
- **TR-5d (rubric):** Percezione abbondanza di achievement (0-2, soglia ≥1):
  - 0: Sembra ancora che siano gli unici 7 di prima
  - 1: Si capisce che questi sono solo esempi, griglia ricca
  - 2: L'utente percepisce "ce ne sono decine, questi sono solo i più cool"

---

## Task 6: Landing page — Pricing sezione (CTAs funzionanti + premium annuale)

**File modificati:**
- `src/app/page.tsx` — riscrivi sezione pricing:
  - FREE card: pulsante usa `FreeCTAButton` da `StripeButtons.tsx` (o SmartCTA equivalent) con comportamento corretto
  - PRO Mensile card: pulsante usa `ProCheckoutButton plan="monthly"` da StripeButtons
  - PRO Annuale card: pulsante usa `YearlyCheckoutButton plan="yearly"` o `ProCheckoutButton` con variante oro
  - Rimuovi TUTTI i `<a href="#">`
  - Enfatizza PRO Annuale con gradient oro, bordi, badge "Miglior rapporto qualità-prezzo", risparmio % evidente, maybe 2 mesi gratis evidenziato
  - Copy migliorato per ogni piano

**Priorità:** critical

**Dipendenze:** Task 1 (riusa componenti esistenti in StripeButtons.tsx — già presenti, basta integrarli)

**Test Requirements (TR):**
- **TR-6a (rule):** Nessun `<a href="#">` nella sezione pricing.
- **TR-6b (rule):** FREE button: onClick → se guest allora sign-in con callback "/dashboard", se logged-in → push "/dashboard".
- **TR-6c (rule):** PRO Mensile button: onClick → se guest → push "/api/auth/signin?callbackUrl=/pricing"; se logged-in → fetch POST "/api/stripe/checkout" JSON `{ plan: "monthly" }` → `window.location.href = data.url`.
- **TR-6d (rule):** PRO Annuale button: onClick → se guest → push "/api/auth/signin?callbackUrl=/pricing"; se logged-in → fetch POST "/api/stripe/checkout" JSON `{ plan: "yearly" }` → `window.location.href = data.url`.
- **TR-6e (rubric):** Premium perception annuale (AC-RU4, scala 0-3, soglia ≥2):
  - 0: Nessuna differenza con mensile
  - 1: Badge solo
  - 2: Oro/giallo, border, copy risparmio chiaro
  - 3: Evidentemente la scelta premium

---

## Task 7: Landing page — Mobile sticky CTA corretto + visual tuning CSS globale

**File modificati:**
- `src/app/page.tsx` — Mobile sticky CTA (bottom bar) sostituisci `<a href="#pricing">` con SmartCTA (stesso comportamento hero primary)
- `src/app/globals.css` — aggiungi animazioni custom leggere:
  - `@keyframes pulse-glow` per glow verde neon intermittente
  - `@keyframes float-slow` per mockup card che "fluttua" leggermente
  - `@keyframes pitch-line-shimmer` per linee campo morbido effetto
  - `.scroll-reveal` utility (transition opacity/translate-y, active via IntersectionObserver optional o al mount semplice)
  - Raffina `.pitch-wrapper::before` e `::after` per maggiore effetto campo
- `tailwind.config.ts` — Aggiungi eventuali colori custom (es. gold chiaro), keyframes, animation utilities se vuoi usare classi Tailwind invece di CSS raw.

**Priorità:** medium

**Dipendenze:** Task 1 (SmartCTA), Task 2-6 (tuning su sezioni già esistenti)

**Test Requirements (TR):**
- **TR-7a (rule):** Mobile sticky CTA non ha `href="#pricing"`; usa SmartCTA o equivalente auth-aware.
- **TR-7b (rule):** `prefers-reduced-motion: reduce` disabilita tutte le nuove animazioni (verifica media query nel CSS).
- **TR-7c (rubric):** Leggerezza e performance animazioni (AC-RU5, 0-3, soglia ≥2):
  - 0: Janky o pesante
  - 1: Ok ma qualche eccesso
  - 2: Tutto CSS/Tailwind, fluido, reduced-motion rispettato
  - 3: Delight, micro-interazioni 60fps, nessun bundle impact

---

## Task 8: Copywriting pass generale landing page (intero file)

**File modificati:**
- `src/app/page.tsx` — revisione TUTTI i testi visibili in italiano:
  - Hero headline/subheadline
  - Badge e microcopy hero
  - How-it-works 3 step (title + description)
  - Demo sezione (titolo, sottotitolo, label statistiche)
  - Card evolution (titolo, footer copy)
  - Achievements sezione (titolo, footer copy, nome/desc ogni achv)
  - Modes sezione (titolo, sottotitoli, bullet points multiplayer)
  - Pricing sezione (titolo, sottotitolo, feature list FREE/PRO mensile/PRO annuale, note footer carta)
  - CTAs labels

**Priorità:** high

**Dipendenze:** Tutti i task 2-6 devono essere completati (devono esistere i testi da revisionare)

**Test Requirements (TR):**
- **TR-8a (rule):** Nessun testo in inglese nel DOM del landing page.
- **TR-8b (rule):** Nessun placeholder tipo `TODO`, `lorem ipsum`, o stringhe grezze.
- **TR-8c (rule):** Consistenza: "calcetto" non "calciotto"; "Career Index" può restare come nome metrica ma copy circostante italiano; "PRO" rimane invariato.
- **TR-8d (rubric):** Qualità copy italiano (AC-RU2, 0-3, soglia ≥2):
  - 0: Inglese mescolato, errori grammatica
  - 1: Corretto ma generico
  - 2: Naturale, giovane, sportivo, persuasivo
  - 3: Eccezionale, memorabile

---

## Task 9: Pagine legali — Placeholder puliti + integrazione data dinamica già pronta (Task1)

**File modificati:**
- `src/app/privacy/page.tsx`
- `src/app/termini/page.tsx`
- `src/app/cookie-policy/page.tsx`
- `src/app/disclaimer/page.tsx`

Cose da fare:
- Verifica che usino LEGAL_CONFIG (già lo fanno) e che i placeholder siano nella forma italiana corretta: `[Dati titolare da completare]`, `[Email di contatto da inserire]`, `[Indirizzo fisico da completare]`
- Se ci sono placeholder tipo `[NOME PROPRIETARIO O RAGIONE SOCIALE]` → uniforma alla notazione richiesta: `[Dati titolare da completare]` per nome/ragione, `[Email di contatto da inserire]` per email, `[Indirizzo fisico da completare]` per indirizzo, `[Partita IVA da inserire]` per VAT
- Aggiungi "Ultimo aggiornamento: {lastUpdatedHuman}" evidente in ogni pagina (potrebbe già esserci nel subtitle — confermare che sia visibile)
- Se qualche sezione manca o è troppo scarna → espandi con struttura legale italiana standard (senza inventare dati)
- Migliora formattazione: bold per titoli sezione, spaziatura migliore, blockquote per disclaimer principale

**Priorità:** medium

**Dipendenze:** Task 1 (legal-config date dinamiche)

**Test Requirements (TR):**
- **TR-9a (rule):** Nessun dato reale fittizio (no "Mario Rossi s.r.l.", no P.IVA "12345678901", no "Via Roma 1"). Solo placeholder con la sintassi `[X da completare/inserire]`.
- **TR-9b (rule):** Placeholder in italiano, non inglese (no "[Owner name]" — deve essere "[Dati titolare da completare]" o simile).
- **TR-9c (rule):** "Ultimo aggiornamento" presente e visibile in TUTTE e 4 le pagine (controllo stringa nel DOM).
- **TR-9d (rubric):** Credibilità e struttura legale (0-2, soglia ≥1):
  - 0: Sembra un draft
  - 1: Struttura credibile, sezione chiare, placeholder puliti
  - 2: Davvero da produzione, formattazione professionale, leggibile

---

## Task 10: Sign-in page migliorata visivamente

**File modificati:**
- `src/app/signin/page.tsx` — Sostituisci stili inline con classi Tailwind, aggiungi atmosfera calcettoxp (pitch lines, glow verde, logo brandizzato), migliora copy, link a termini/privacy più carino. Mantieni GoogleSignInButton (non toccarlo se funziona).

**Priorità:** low (nice-to-have ma integrato nella UX)

**Dipendenze:** nessuna

**Test Requirements (TR):**
- **TR-10a (rule):** Usa `<GoogleSignInButton />` importato da `@/components/auth/GoogleSignInButton` (mantieni comportamento invariato).
- **TR-10b (rule):** Link a privacy e termini presenti.
- **TR-10c (rubric):** Coerenza visiva col landing (0-2, soglia ≥1):
  - 0: Bianco e nero stile Google base, nessuna relazione con landing
  - 1: Riconoscibile come CalcettoXP, verde neon presente
  - 2: Allineato perfettamente col resto del brand, piacevole

---

## Task 11: Build validation + fix errori TypeScript/Next.js build

**File modificati:** potenzialmente tutti i file dei task precedenti per fix di tipi/build.

**Passi:**
1. `npx tsc --noEmit`
2. `npm run build`
3. Fix ogni errore
4. Ripeti finché build pulita
5. Manual check: ispeziona tutte le sezioni landing per assicurarti che nessun CTA linki a `#`

**Priorità:** critical

**Dipendenze:** TUTTI i task da 1 a 10 completati (perché è validazione di tutto)

**Test Requirements (TR):**
- **TR-11a (rule):** `npx tsc --noEmit` → exit code 0.
- **TR-11b (rule):** `npm run build` → exit code 0.
- **TR-11c (rule):** Grep su `src/app/page.tsx` per `href="#"` → 0 risultati.
- **TR-11d (rule):** Grep su `src/app/page.tsx` per `href="#pricing"` → 0 risultati (i link a pricing devono essere SmartCTA o pulsanti auth-aware, non ancore statiche).
- **TR-11e (rubric):** Stabilità e pulizia finale (0-2, soglia ≥1):
  - 0: Errori residui, warning grossi
  - 1: Build pulita, zero warning critici
  - 2: Build ottimizzata, nessun console.error al mount della landing

---

## Regole di Implementazione Generali

1. **NON toccare:** `prisma/schema.prisma`, `src/auth.ts`, `src/auth.config.ts`, `src/app/api/stripe/**/*.ts`, `src/app/api/auth/**/*.ts`, `src/lib/stripe.ts`, `src/lib/career-index.ts`, `src/lib/ovr.ts`, `src/lib/xp-levels.ts`, `src/app/middleware.ts` — questi sono backend flow esistenti e solidi.
2. **Prima di modificare un file esistente:** fare sempre Read per ultima versione (evitare conflitti Edit su contenuto stale).
3. **Preferisci riuso:** Button, Card, Badge, StripeButtons esistono — usali invece di creare button ad-hoc `<a>` con stili inline.
4. **Italiano nel DOM, inglese nel codice:** Nomi variabili, funzioni, componenti in inglese; testi JSX in italiano.
5. **Nessun console.log di debug nel codice finale di produzione.**
