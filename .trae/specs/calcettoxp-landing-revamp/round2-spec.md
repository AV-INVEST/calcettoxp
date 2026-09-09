# CalcettoXP — Round 2 Production Fix + Visual Polish Specification

Created: 2026-09-09 (Round 2 spec — incremental fix on top of approved landing revamp)
Parent Spec Location: `.trae/specs/calcettoxp-landing-revamp/

## Problem Statement

Round 1 landing revamp is deployed and structurally passing builds. Live production smoke reveals 8 concrete problems:
1. **CRITICAL: Google OAuth fails `redirect_uri_mismatch` on all auth CTAs in production (`https://www.calcettoxp.com`)
2. Legal pages visibly render placeholders (`[Dati titolare...]`, `[Partita IVA...]`, `[Email...]`, `[Indirizzo...]`) in public DOM
3. Card Evolution tappi overlap cards top-right (TAPPA pill is visually broken/cheap)
4. Hero Mini Career Index chart near demo player card is almost flat/static — no visual narrative (VITTORIA/SCONFITTA/PAREGGIO)
5. Demo players (4: ATT/CEN/DIF/POR) need to remain intact; polish consistency with new hero chart
6. CTAs/buttons need stronger football/game micro-polish with proper icons + hover/press neon states
7. Stripe flow must pass code-read audit (mapping, no duplicate subscriptions)
8. Misc obvious visual regressions from R1 + mandatory searches for public unfinished text

## Users and Goals
**Users**: Real CalcettoXP visitors, authenticated users in LIVE production:
- Anonymous football/calcetto player landing on calcettoxp.com (Italian)

**Primary Goal**: Fix all 8 items while not breaking anything working backend (Auth.js v5, Stripe webhook, Prisma, PWA, Vercel deploy.)

**Non-goals**
- Do NOT change Prisma schema (last round fixed P1012; leave alone.)
- Do NOT touch auth API, GoogleSignInButton internals, Stripe webhook route handler
- Do NOT re-re-reinvent whole landing/sections (incremental only)
- Do NOT add heavy animation libs (GSAP, Framer, etc.)
- Do NOT change installed npm packages/deps (no `package.json` edits)
- Do NOT fabricate legal/business data (VAT/PIVA/Cod.Fisc./office address/company)
- Do NOT put fake GDPR/certification claims we can't prove
- Do NOT invent cookies/analytics/ads providers not actually implemented

## Constraints and Dependencies

**URLs (user-declared canonical production):**
- Canonical live PRODUCTION domain = `https://www.calcettoxp.com`
- Bare domain also redirects: `https://calcettoxp.com` → www
- Google OAuth callback = `https://www.calcettoxp.com/api/auth/callback/google`
- Also registered (for redirect_uri safety): bare `https://calcettoxp.com/api/auth/callback/google`
- Known real info (IT)
  - Service name = CalcettoXP
  - Contact email = calcettoxp@gmail.com
  - Domain = www.calcettoxp.com / calcettoxp.com

**Available ENV vars (do not add new ones unless Auth.js v5 supports them):**
- `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` (already in env per user's list — Auth.js v5 legacy)
- `NEXT_PUBLIC_APP_URL` (currently defaults to `https://calcettoxp.com` NO-WWW — root cause of mismatch!)
- optionally support: `AUTH_URL` (Auth.js v5 modern) as synonym

**Auth.js version:** v5 beta 25 installed; `signIn("google")` from client, `signIn: "/signin"` custom pages.

**Career Index algorithm reference:** `src/lib/career-index.ts` caps:
- win=+15 base; draw=+3; loss=−10
- role modifiers change goal/assist weights; clean sheet +8; win bonus +5; draw +2
- HARD cap: change ∈ [−20, +40]
- Hero animation sample values MUST stay within these bounds.

## Functional Requirements

### FR-1 Google OAuth Production Redirect Consistency (Critical)
- Introduce single canonical `getAppBaseUrl()` source of truth server-side
- Return `AUTH_URL ?? NEXTAUTH_URL ?? NEXT_PUBLIC_APP_URL` with default = `https://www.calcettoxp.com` (WWW, trailing-slash stripped)
- Wire into: auth.config callbacks, middleware signIn URL, Stripe success/cancel URLs, layout metadata site URL, sitemap, robots, share card URLs.
- Report to user EXACT redirect_uri sent to Google. Report Google Cloud Authorized Origins & Redirect URIs list.
- Every auth entry point consistent. 6 SmartCTA + FreeCTAButton + StripeButtons guest. No competing signIn flows.

### FR-2 Legal: Zero Public Placeholders (Hard rule)
- Replace LEGAL_CONFIG: drop ALL `[..da completare/inserire]` — no placeholders, `ownerName`/`vatId`/`address`/`companyName` removed as fields; use only real info.
- `LEGAL_LAST_UPDATED = static constant date "9 settembre 2026" = actual revision date; NO runtime new Date() per legal pages.
- Rewrite 4 legal pages:
  - Strip out lines/sections with missing info; if info absent → REMOVE that entire row not a placeholder.
  - Keep product-relevant architecture facts only (Google auth, Stripe PCI, Neon DB, match data self-reported, strict necessary cookies only).
  - No 100% GDPR compliance claims or certification.

### FR-3 Evolution Cards Timeline Redesign
- Preserve 4 stages (Novizio/Emergente/Affermato/Veterano)
- TAPPA pill integrated cleanly (ABOVE card or inside proper header, NO overlap)
- Animated connection line between stages. Travelling green light pulse.
- Final Veterano subtly gold.
- No clutter. Perfect mobile layout.

### FR-4 Hero Animated Career Index
- Replace/redesign MiniCIIndex into vivid animated sequence demo
- 8-9 match sequence Win/Draw/Loss results Career Index change
- Consistent with career-index.ts caps (no outside ±40 gain or <-20 loss)
- Animated line drawing, up=green dots, down=red, draw=gray, animated counter
- Pills labels "VITTORIA +18" or similar; glow at each step; light animation
- Loop slowly or replay. No heavy dep

### FR-5 Demo Players Keep + Consistency
- Preserve 4 demo players (Andrea ATT / Federico CEN / Riccardo DIF / Marco POR) with non-linear arrays
- Keep non-linear; improve chart points/tooltips make V/D/L clear if possible

### FR-6 Football/Game Buttons
- 4 CTAs icons+ micro-polish: ACCEDI, CREA LA TUA CARRIERA, SOLO CAREER, PRO buttons)
- Lucide icons correct

### FR-7 Stripe Audit
- Code read (no runtime): monthly→correct, yearly→correct, guest→auth, auth→POST /api/stripe/checkout→, duplicate guard active subscription, portal works, no homepage fallbacks.

### FR-8 Visual QA + mandatory searches
- Overlap, overflow, alignment. Search project: href="#", da completare/inserire/placeholder, [Dati/Email, TODO FIXME. User-visible hits zero. Code comments OK.

## Non-Functional Requirements

NFR-1 Build green: tsc exit 0, prisma generate exit 0, Next prod build exit 0 after Remove-Item .next clean.
NFR-2 No breaking changes to Prisma/StripeWebhook/Auth/PWA.
NFR-3 No new deps; pure existing (lucide/react recharts).
NFR-4 Mobile-first; no x-overflow, no tiny labels.
NFR-5 prefers-reduced-motion respected.

## Assumptions
`NEXT_PUBLIC_APP_URL` ENV in Vercel production either empty or set non-canonical. Fix in code to default www regardless.

Acceptance Criteria
--------------
Type rule or rubric only.

RULE AC-R1 (Critical Auth) Google Auth Flow — no competing sources for base URL: single exported getAppBaseUrl used everywhere; www default canonical; 0 hardcoded non-www calcettoxp.com remaining as fallback defaults.

RULE AC-R2) Public legal pages — public DOM zero grep "da completare/inserire", zero `[`, zero placeholder.

RULE AC-R3) LEGAL_LAST_UPDATED static literal "9 settembre 2026" (100% static) constant used across privacy/termini/cookie/disclaimer; NO new Date for legal last update.

RULE AC-R4) Evolution tappi: at TAPPA label overlap zero overlap cards; stage pill not overlapping any content area/OVR badge; proper timeline layout; mobile OK.

RULE AC-R5) Hero CI animation: 8+ demo match events, up/down/flat draws, green up/red down/gray draw, animated counter, CSS-only/SVG-only anims, no new dep.

RULE AC-R6) Stripe audit: code passes: Free→/dashboard or signin, ProCheckoutButton monthly plan, Yearly plan yearly, hasActivePro guard 409 dup-prevent, portal ok, success cancel correct, window.location not router.

RULE AC-R7) Search sweep: `rg -n "href=\"#\""` 0 hits; public TODO/FIXME/hits not user visible zero; legal/OK; [A-Z].* da completare 0;

RULE AC-R8) tsc --noEmit exit 0; prisma generate exit 0; clean .next then build exit 0.

RULE AC-R9) git sw.js restored; git diff stat meaningful, no public/sw in output.

RUBRIC AC-RU1) Auth UX overall quality (0-3). 0=fail, 1=works, 2=strong canonical, 3=perfect canonical one-source + complete report.

RUBRIC AC-RU2) Legal doc genuine feel (0-3). Score 3 if reads like real production docs with only facts, no missing data, no placeholders, section numbering.

RUBRIC AC-RU3) Evolution section progression game feel (0-3). 0=still overlap. 3=football levelling videogame.

RUBRIC AC-RU4) Hero chart animation impact (0-3). 3=immediate visual V/D/L story.

RUBRIC AC-RU5) Micro CTA/buttons football (0-3). 3=gaming micro-polish.
