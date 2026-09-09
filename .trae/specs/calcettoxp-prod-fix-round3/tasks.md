# CalcettoXP — Production Fix Pass Round 3
## Implementation Tasks Queue

Ogni task è mappato ai Criteri di Accettazione di spec.md.

---

## Task 1: Prisma migration + Vercel auto-deploy + seed

**Priority**: HIGH
**Status**: pending
**Maps to AC**: R1, R2, R3, R6
**Scope**: prisma/schema.prisma (readonly check), prisma/migrations/ creazione, package.json scripts, prisma/seed.ts readonly + comando deploy idempotente.

### Descrizione
Creare la migration INITIAL completa dello schema corrente, impostare la pipeline di Vercel in modo che esegua `prisma migrate deploy` PRIMA del build Next.js. Verificare che il seed degli achievements sia idempotente e fornire un comando per eseguirlo dopo la prima migration senza duplicare righe ad ogni deploy.

### Test Requirements (TR)
| ID | Tipo | Pass condition | Evidence source |
|---|---|---|---|
| T1-R1 | rule | `prisma/migrations/<timestamp>_init/migration.sql` contiene TUTTI i modelli (User, Account, Session, VerificationToken, PlayerProfile, Match, CareerIndexHistory, PlayerSeason, Achievement, PlayerAchievement, Subscription, Team, TeamMember, MatchParticipant, MatchConfirmation), 8 enum (Role, MatchResult, PreferredFoot, VerificationType, AchievementTier, SubscriptionStatus, AchievementRequirementType), tutti gli unique/index e relations onDelete. | `npx.cmd prisma validate` stdout + file contents ispezione |
| T1-R2 | rule | `prisma:deploy` script esiste in package.json; il build script o pipeline esegue `prisma migrate deploy` then `next build`. | `cat package.json` |
| T1-R3 | rule | `npx.cmd prisma validate` exit 0 | terminal exit code |
| T1-R4 | rule | `npx.cmd prisma generate` exit 0 | terminal exit code |
| T1-R5 | rule | `npx.cmd prisma migrate status` exit 0 (local può dire "can't connect" se no DB → accettato se local DATABASE_URL non è popolato ma schema e migration esistono) | terminal output |
| T1-R6 | rule | `prisma/seed.ts` usa ESCLUSIVAMENTE upsert where:{key} per achievements (idempotente). Aggiunto in package.json uno script o documentato che `npm.cmd run prisma:seed` è da eseguire UNA SOLA volta dopo init migration (ma è safe a ripetere). | file contents |

### Blocked By: nessuno
### Unblock Condition: —
### Completion Evidence: (da completare in Implementazione)

---

## Task 2: Player photos usage (4 jpg → demoPlayers + 3 locations)

**Priority**: HIGH
**Status**: pending
**Maps to AC**: R7, R8, R9, U2
**Scope**: page.tsx (demoPlayers array, DemoPlayerCard, desktop selected-player role icon, MobilePlayerFlipCard + nuovo selector compatto).

### Descrizione
- Import statico di Andrea.jpg, Federico.jpg, Riccardo.jpg, Marco.jpg da assets/ → campi image in demoPlayers ognuno con alt personalizzato.
- DemoPlayerCard (desktop): sostituire il RoleIcon grande 32×32 centrale con `<Image>` cover + overlay scuro/verde; role icon ora small badge mini top-right della foto.
- Desktop career demo section (sotto tabs buttons, wrapper grid lg:grid-cols-[320px_1fr]): la card demo a sx riceve la photo da DemoPlayerCard (già fatto se si modifica DemoPlayerCard). Il blocco info a dx che attualmente mostra `<Hand/Shield/Compass/Target> w-12 h-12` → sostituire con foto tonda piccola del giocatore + role label; icona ruolo solo come small badge.
- MobilePlayerFlipCard:
  1. FRONT sostituisce icona ruolo grande con `<Image>` rounded cover overlay + role badge mini.
  2. Aggiungere selector compatto 4 giocatori: SOPRA o SOTTO la flip card, 4 foto/average circolari `h-9 w-9 gap-2` (o pills con foto small). Click su uno → cambia stato interno selectedPlayerId → riflette la stessa card singolo (non 4 card giganti verticali).
  3. Mantenere auto-flip 4.5s, tap manuale, prefers-reduced-motion, indicators ●○.

### Test Requirements (TR)
| ID | Tipo | Pass condition | Evidence source |
|---|---|---|---|
| T2-R1 | rule | Ogni oggetto demoPlayers ha proprietà `image: StaticImageData` e `imageAlt: string` con valori per Andrea/Federico/Riccardo/Marco mappati correttamente. | page.tsx source + `tsc exit 0` (type check import) |
| T2-R2 | rule | DemoPlayerCard: div centrale "role square" 32×32 → sostituito con `<Image>` object-cover rounded; roleIcon ora small badge (≤ 20px) sovrapposto/accanto. OVR, name, role, level, stats mantenuti. | Rendered JSX ispezione |
| T2-R3 | rule | Desktop player career section (linee 648-660 circa): la card role wrapper w-24 h-24 usa `<Image>` tonda piccolo + role small badge, non icona grossa. | Rendered JSX |
| T2-R4 | rule | MobilePlayerFlipCard usa selectedPlayer state + selector 4 foto/average; click cambia giocatore sulla STESSA card; NO 4 cards giganti verticali. | JSX + md:hidden controlla |
| T2-R5 | rule | `<Image>` ha width/height espliciti (o fill parent con object-cover) → next/image non solleva warning. Alt text corretto per lingua italiana. | Next build warnings in stdout |
| T2-R6 | rule | prefers-reduced-motion rispettato (auto-flip disabilitato se media query reduce). | useEffect MQL in MobilePlayerFlipCard |
| T2-U1 | rubric (0-2) | Qualità integrazione foto: 0=stretch/nessun overlay, 1=overlay base, 2=overlay dark/green, rounded, preserve subject, small badge ruolo. Threshold ≥ 2. | Manual visual check JSX structure |

### Blocked By: nessuno (indipendente da DB Task 1, ma stesso file page.tsx — serializzare Task 2 dopo Task 1? NO, modificano parti separate di page.tsx. Possono andare in seriale Task 1 → Task 2 → Task 3)
### Unblock Condition: —
### Completion Evidence:

---

## Task 3: Desktop display conflicts fix + content max-width + compact spacing

**Priority**: HIGH
**Status**: pending
**Maps to AC**: R10, R11, R12, R13, U1, U3
**Scope**: page.tsx (8 occorrenze `hidden md:block` auditate → convertire quando elemento stesso è grid/flex; inoltre max-w-7xl → 6xl/5xl/4xl per sezione; card padding p-12/p-14 → p-8/p-9; section py-32 → md:py-24).

### Descrizione
Audit completo delle classi display in page.tsx. Pattern `hidden md:block` seguito da `grid` o `flex` internamente → SBAGLIATO perché md:block sovrascrive display grid/flex. Correggere in `hidden md:grid ...` o `hidden md:flex ...`.

Poi revisionare max-w-7xl per wrapper content:
- Hero content wrapper: max-w-5xl o 6xl.
- Come funziona desktop content: max-w-5xl.
- Players / career demo desktop: max-w-6xl.
- CI demo card e regole wrapper: max-w-4xl.
- Evolution: max-w-5xl.
- Trofei desktop: max-w-5xl (già 6xl, abbassare a 5xl).
- Solo/Multiplayer desktop: max-w-5xl (già 6xl, abbassare).
- Pricing desktop: max-w-5xl (già 6xl, abbassare).
- Final CTA: max-w-4xl.

Revisionare spaziature:
- `md:py-28 md:py-32` → provare a portare a `md:py-24` (96px) per la maggior parte; hero e final cta possono stare più alti.
- Card `p-14 p-12 p-9` → `p-8 md:p-9` (32-36px) per cards Come funziona / Solo / Multiplayer / Pricing.

### Occorrenze `hidden md:block` (dall'audit grep, 8 entries):
| Linea nel file attuale | Contesto | Correttivo stimato |
|---|---|---|
| 539 | `hidden md:block relative` (hero demo right) → wrapper interno NON è grid/flex → OK, lasciare. | Nessuna modifica |
| 573 | `hidden md:block text-xl` solo testo → OK. | Nessuna modifica |
| **601** | `hidden md:block relative grid md:grid-cols-3` → VIOLA! md:block sovrascrive grid | → `hidden md:grid relative md:grid-cols-3` |
| **622** | sezione intera `hidden md:block py-20 md:py-32` → wrapper section (display:block giusto, children sono grid a parte) → OK, solo abbassare py | Spaziatura py |
| **794** | `hidden md:block relative max-w-5xl` → wrapper, children `grid md:grid-cols-4` separato → OK | Nessuna modifica display |
| **885** | `hidden md:block max-w-6xl` → wrapper, children `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` separato → OK | max-w-6xl → 5xl |
| **996** | `hidden md:block grid md:grid-cols-2` → VIOLA! md:block sovrascrive grid | → `hidden md:grid md:grid-cols-2` |
| **1151** | `hidden md:block grid md:grid-cols-3` → VIOLA! md:block sovrascrive grid | → `hidden md:grid md:grid-cols-3` |

**→ 3 righe VIOLANO**: linee 601, 996, 1151 (grid sovrascritto). Queste sono le cause principali del bug desktop.

Altre ricerche: anche `hidden md:block + flex` → grep per `hidden md:block` e poi flessibili nel DOM. Non emerse dal grep iniziale.

### Test Requirements (TR)
| ID | Tipo | Pass condition | Evidence source |
|---|---|---|---|
| T3-R1 | rule | Riga 601 Come funziona: display class è `hidden md:grid md:grid-cols-3 gap-7 ...` (no md:block). | grep linee 601 |
| T3-R2 | rule | Riga 996 Solo/Multiplayer: display class è `hidden md:grid md:grid-cols-2 ...` (no md:block). | grep linee 996 |
| T3-R3 | rule | Riga 1151 Pricing: display class è `hidden md:grid md:grid-cols-3 ...` (no md:block). | grep linee 1151 |
| T3-R4 | rule | Almeno 6 sezioni usano max-w-6xl / max-w-5xl / max-w-4xl invece di max-w-7xl. Conteggio: max-w-7xl usato 0 o 1 sola volta (solo hero section background, non content). | grep "max-w-7xl" in page.tsx ≤ 1 occorrenza |
| T3-R5 | rule | Section padding md:py-32 usato ≤ 2 volte (solo hero e final cta). Altre section: md:py-24 o md:py-20. | grep "md:py-32" ≤ 2 occorrenze |
| T3-R6 | rule | Card padding p-14/p-12 in desktop cards (Come funziona, Solo, Multiplayer, Pricing) ≤ 1 occorrenza residua; resto usa p-8 o p-9. | grep in page.tsx JSX cards |
| T3-R7 | rule | 360px viewport: NO horizontal overflow. Verifica: wrapper principali hanno w-full o max-w-[100vw] overflow-hidden. Page body non scrolla orizzontale. | Concettuale: tutte le card usano max-w-xs/max-w-sm + px-4. |
| T3-U1 | rubric (0-2) | Desktop compatto a 1440px: 0=stretch edge-to-edge, 1=centrato ma padding eccessivo, 2=centrato con margini sostanziali, section width coerenti, visual premium. Threshold ≥ 2. | Audit wrapper max-w values + padding |
| T3-U2 | rubric (0-2) | Mobile preservation: 0=peggiorato (overflow o wrap CTA), 1=invariato, 2=stessa qualità + selector giocatore compatto funziona bene. Threshold ≥ 2. | 360/390/430 check responsive classes |

### Blocked By: Task 2 completato? NO, ma stesse modifiche page.tsx — conviene serializzare Task 1 → Task 2 → Task 3 per non avere conflitti di Edit.
### Unblock Condition: —
### Completion Evidence:

---

## Task 4: Full validation (build chain + visual QA)

**Priority**: HIGH
**Status**: pending
**Maps to AC**: R3, R4, R5, R13, R14, U1, U2, U3
**Scope**: Terminal commands + ispezione responsive concettuale + visual QA checklist.

### Test Requirements
| ID | Tipo | Pass condition |
|---|---|---|
| T4-R1 | rule | `npx.cmd prisma validate` exit 0 |
| T4-R2 | rule | `npx.cmd prisma generate` exit 0 |
| T4-R3 | rule | `npx.cmd tsc --noEmit` exit 0 |
| T4-R4 | rule | `npm.cmd run build` exit 0 |
| T4-R5 | rule | Build artifacts sw.js e workbox ripristinati (git restore) se modificati. |
| T4-R6 | rule | Visual QA checklist 6 viewport eseguita e registrata: 360, 390, 430, 1280, 1440, 1920. Per ciascuna: desktop checks (Come funziona 3col, Solo/Multiplayer 2col, Pricing 3col, no edge-to-edge, foto player presenti); mobile checks (1 card, selector compatto, NO wrap CTA, no overflow). |

### Blocked By: Task 1 AND Task 2 AND Task 3 completed
### Completion Evidence: Terminal stdout + checklist riempita nel report finale

---

## Overall Dependency Graph
Task 1 (Prisma migration + deploy script) → Task 2 (Player photos) → Task 3 (Desktop display + spacing) → Task 4 (Full validation).

Motivazione:
- Task 1 non tocca page.tsx (solo prisma/ + package.json).
- Task 2 e Task 3 toccano entrambi page.tsx → **serializzati** per evitare conflitti di multi-edit sullo stesso file.
- Task 4 solo dopo tutti gli altri.
