# CalcettoXP — Production Fix Pass Round 3
Specifica dei Requisiti

## Problema
Il deploy di produzione su Vercel ha tre problematiche concrete e distinte che affliggono l'app dopo l'ultimo redesign mobile:
1. **Google Auth fallisce a runtime** con `AdapterError` / `Prisma table public.Account does not exist` perché non sono MAI state create le tabelle Prisma su Neon (manca migration directory, manca `prisma migrate deploy` nella pipeline Vercel).
2. **4 foto reali dei giocatori** presenti in `assets/*.jpg` non sono utilizzate; le card demo mostrano solo una grande icona di ruolo al centro.
3. **Desktop layout rotto**: pattern `hidden md:block + grid/flex` conflittuali fanno sì che sezioni desktop (Come funziona, Solo/Multiplayer, Pricing, Players) appaiano impilate verticalmente in full-width invece che in colonne compatte centrate.

## Utenti
- Utenti finali (nuovi login Google → account deve essere persistito senza errore)
- Visitatore desktop (landing deve apparire premium, compatto, con colonne)
- Visitatore mobile (landing migliorata nel round precedente → NON deve peggiorare)
- Sviluppatore/proprietario del repo (push → Vercel deploya migrazioni Prisma automaticamente)

## Obiettivi
1. Risolvere definitivamente il bug di auth/DB in produzione.
2. Integrazione delle foto reali in card giocatore (desktop + mobile selector compatto).
3. Ripristinare un layout desktop premium compatto, centrato, con colonne corrette.
4. Non danneggiare mobile (360 / 390 / 430).

## Non-Goals
- **NON** rifare un redesign generale della landing.
- **NON** toccare logica backend Auth.js, Stripe, Prisma models (se non per creazione migration).
- **NON** cambiare price ID Stripe / logica webhook.
- **NON** riscrivere pagine legali.
- **NON** aggiungere toggle cookie analitici/marketing.
- **NON** usare hosting immagini esterno / CDN / librerie esterne nuove.
- **NON** usare `prisma migrate reset` / DROP / cancellazione dati di produzione esistenti.

---

## Requisiti Funzionali

### FR-1 — Prisma: Creazione INITIAL migration dello schema corrente
- Contenere TUTTI i modelli Prisma attuali: User, Account, Session, VerificationToken, PlayerProfile, Match, CareerIndexHistory, PlayerSeason, Achievement, PlayerAchievement, Subscription, Team, TeamMember, MatchParticipant, MatchConfirmation.
- Contenere tutti gli enum, relation onDelete, index e unique constraint esistenti in schema.prisma.
- File collocati in `prisma/migrations/<timestamp>_init/migration.sql` e `migration_lock.toml`.

### FR-2 — Read-only DB state check
- Prima di applicare migration, tentare un READ di `query_raw` o controllo table listing su public schema.
- Se schema vuoto → applica migration normalmente.
- Se tabelle esistono già parzialmente → baseline/fallback safe che non distrugga dati. **OBIETTIVO**: preservare ogni riga esistente.

### FR-3 — package.json scripts e pipeline Vercel
- Aggiungere script `"prisma:deploy": "prisma migrate deploy"`.
- Script di build DEVE eseguire, in ordine: `prisma generate` (già in postinstall) → `prisma migrate deploy` → `next build`.
- Metodo più sicuro per Vercel: aggiornare `build` in package.json o usare un file `vercel.json` se già supportato. Preferire modifica a `build` in package.json perché è il default di Vercel.
- **NON** introdurre nuove variabili ambiente obbligatorie. Se Neon fornisce automaticamente un DIRECT_URL già esistente usarlo; altrimenti restare su DATABASE_URL.

### FR-4 — Seed idempotente
- `prisma/seed.ts` già usa `prisma.achievement.upsert(where:{key})` e NON distrugge duplicati.
- Assicurarsi che il seed venga eseguito in produzione UNA SOLA volta dopo la creazione dello schema, e non ad ogni deploy (a meno che upsert non sia safe).
- Aggiungere eventualmente un prisma:seed script eseguibile manualmente o un hook di deploy per inizializzare achievements nel primo deploy.

### FR-5 — Auth runtime: Account/User vengono persistiti
- Dopo il fix, il flusso: Google login → Google Consent → callback → Auth.js PrismaAdapter DEVE poter scrivere `User`, `Account`, `Session` su Neon senza errori.
- **Questo è un criterio di accettazione finale verificabile solo dopo il deploy Vercel.**

### FR-6 — Uso 4 foto giocatore reali (assets/*.jpg)
- Aggiungere campo `image` (import statico Next.js Image) a ogni oggetto in `demoPlayers`.
- Mapping: Andrea → Andrea.jpg, Federico → Federico.jpg, Riccardo → Riccardo.jpg, Marco → Marco.jpg.
- Alt italiano corretto: `"Andrea - Attaccante CalcettoXP"`, ecc.
- Applicare foto in:
  - (A) Desktop `DemoPlayerCard` (sostituire grande icona ruolo centrale con la foto).
  - (B) Desktop selected-player career demo (sostituire icona ruolo 24×24 con foto tonda piccola + badge ruolo piccolo).
  - (C) Mobile `MobilePlayerFlipCard` fronte (sostituire grande icona ruolo con foto).
- Foto deve avere rounded corners, object-cover preserve subject, overlay dark/green sottile per leggibilità testo. OVR badge, role, level, name, stats NON vanno persi.
- (C)+ Mobile: Aggiungere **selector compatto** 4 giocatori (4 foto/average circolari piccole, es. `h-9 w-9`). Cliccando, la SINGOLA flip card si aggiorna a quel giocatore. Mantenere flip + auto-flip funzionanti.

### FR-7 — Fix desktop display conflicts
- Auditare e correggere **tutte** le occorrenze in page.tsx di pattern:
  - `hidden md:block + grid` → correggere in `hidden md:grid` (rimuovere l'override che annulla grid).
  - `hidden md:block + flex` → correggere in `hidden md:flex`.
- Voci specifiche da controllare e fixare:
  - 1. Come funziona: desktop 3 colonne orizzontali (non 3 righe full-width).
  - 2. Solo/Multiplayer desktop 2 colonne bilanciate.
  - 3. Pricing FREE / Mensile / Annuale: 3 colonne desktop compatte.
  - 4. Demo players / career section: visual ricca ma non stracarica di width.
  - 5. Career Index: centered e leggibile, non stretch edge-to-edge.
  - 6. Trophy section: compatta, centrata, non gigante.
  - 7. Evolution section: 4 step connessi visivamente, compatti.
- Pattern: section **BACKGROUNDS** full-width, **CONTENT WRAPPER** con max-w intenzionale.

### FR-8 — Desktop width system (max-w non indiscriminato)
- Sostituire `max-w-7xl` usato ovunque con larghezze intenzionali:
  - max-w-6xl per la maggior parte delle sezioni contenuto principale.
  - max-w-5xl per sezioni dense (CI, Evolution).
  - max-w-4xl per contenuti focalizzati (hero copy, final CTA).
- Non sostituire meccanicamente; decidere per sezione.
- A 1440px, la landing deve sembrare centrata con margini esterni sostanziali, non cards edge-to-edge.

### FR-9 — Desktop spacing compact
- Revisionare `md:py-28 / md:py-32 / p-12 / p-14` nelle sezioni desktop.
- Target: section vertical padding ~72–96px; card padding 24–36px.
- Premium compatto: forte gerarchia, non aree vuote giganti.

### FR-10 — Mobile preservation
- Mobile a 360/390/430px NON deve ricevere regressioni.
- Flip card, sheet bottom header, cookie banner compatto, section order invariati.
- **Unico cambiamento mobile atteso**: selector compatto 4 giocatori nella sezione card.

---

## Requisiti Non Funzionali

### NFR-1 — Sicurezza e dati
- Nessun commit di .env o credenziali.
- Nessun drop / reset del database.
- Seed upsert-only, non distruttivo.

### NFR-2 — Performance
- Immagini giocatore gestite da Next.js Image (lazy loading automatico, sharp già installato).
- Nessuna nuova dipendenza npm.
- prefers-reduced-motion rispettato in ogni animazione (auto-flip, CI loop, neon effects).

### NFR-3 — Accessibilità
- Target touch min 44×44px per selector mobile giocatori.
- Alt text significativo sulle foto.
- Nessun horizontal overflow a 360px.

### NFR-4 — Build/TS passano
- `npx prisma validate` exit 0.
- `npx prisma generate` exit 0.
- `npx tsc --noEmit` exit 0.
- `npm run build` exit 0.

### NFR-5 — Visual QA
Ispezionare (almeno concettualmente tramite le classi):
- 360px, 390px, 430px (mobile)
- 1280px, 1440px, 1920px (desktop)

---

## Vincoli, Dipendenze, Assunzioni

- **Vincolo**: DATABASE_URL già configurato via Vercel ↔ Neon integration automatica. Non toccare.
- **Dipendenza**: Prisma 6 già presente; PrismaAdapter di @auth/prisma-adapter già usato in `src/auth.ts`.
- **Assunzione**: Neon public schema attualmente vuoto (perché l'errore è "table does not exist"). Se invece ci sono tabelle parziali create a mano, si usa prisma migrate resolve --applied o baseline senza distruggere.
- **Assunzione**: 4 jpg in assets/ sono foto square o verticali; usare object-cover + centered crop per non stretching.
- **Vincolo UI**: Copy pubblico rimane 100% italiano; codice e commenti tecnici inglese.

---

## Criteri di Accettazione (AC)

### Rule (condizione binaria verificabile)
- **AC-R1**: `prisma/migrations/<timestamp>_init/migration.sql` esiste e contiene TUTTI i 16 modelli + 8 enum + tutti gli indici/relazioni.
- **AC-R2**: `package.json` contiene `"prisma:deploy": "prisma migrate deploy"` e la pipeline di build esegue `prisma migrate deploy` PRIMA di `next build`.
- **AC-R3**: `npx prisma validate` exit code 0.
- **AC-R4**: `npx tsc --noEmit` exit code 0.
- **AC-R5**: `npm run build` exit code 0.
- **AC-R6**: Seed rimane idempotente (tutti gli achievement usano upsert by key).
- **AC-R7**: In demoPlayers, ogni oggetto ha il campo `image` con import statico della jpg corretta.
- **AC-R8**: DemoPlayerCard sostituisce RoleIcon centrale con `<Image>` del giocatore; icona ruolo rimane solo come small badge opzionale.
- **AC-R9**: MobilePlayerFlipCard usa `<Image>` invece di RoleIcon grande; aggiunto selector compatto 4 foto/average; un click cambia la card e mantiene flip.
- **AC-R10**: Nessuna occorrenza residuale di `hidden md:block + grid` o `hidden md:block + flex` dove l'elemento stesso deve essere grid/flex.
- **AC-R11**: Le sezioni Come funziona, Solo/Multiplayer, Pricing usano almeno `md:grid md:grid-cols-{3,2,3}` rispettivamente.
- **AC-R12**: Contenuti wrapper usano max-w-6xl / max-w-5xl / max-w-4xl in modo intenzionale (non più max-w-7xl ovunque).
- **AC-R13**: A 360px non esiste horizontal overflow.
- **AC-R14**: Verifica browser/responsive (almeno concettuale) eseguita e registrata in evidence per 360/390/430/1280/1440/1920.

### Rubric (valutativa qualitativa)
- **AC-U1 — Qualità desktop compatto (0-2)**: Scale 0=stracarico/stretch, 1=migliorato ma qualche area vuota, 2=premium compatto, centrato, gerarchico. Soglia: ≥ 2.
- **AC-U2 — Foto integrazione (0-2)**: 0=ruvida, 1=funziona ma manca overlay, 2=premium con overlay dark/green, rounded, preserve subject. Soglia: ≥ 2.
- **AC-U3 — Mobile preservation (0-2)**: 0=peggiorato, 1=uguale, 2=stesso livello qualità + selector aggiuntivo funziona. Soglia: ≥ 2.
