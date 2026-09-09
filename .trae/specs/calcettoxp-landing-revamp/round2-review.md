# CalcettoXP Round 2 — Independent Review

Parent: `.trae/specs/calcettoxp-landing-revamp/round2-spec.md` + `round2-tasks.md`
Review Date: 2026-09-09
Commit: HEAD 82dd90304d384d164be1470e4cbcef59322ee67b

---

## Acceptance Criteria (rule) — Pass/Fail

| # | AC | Result | Evidence |
|---|---|---|---|
| AC-R1 | Single canonical base URL helper; www default; 0 remaining bare non-www fallback defaults | **PASS** | New file `src/lib/app-url.ts` exports `getAppBaseUrl()` = AUTH_URL \|\| NEXTAUTH_URL \|\| NEXT_PUBLIC_APP_URL \|\| "https://www.calcettoxp.com", trailing stripped. grep `'https://calcettoxp.com'` (hardcoded bare default literal) in src ts/tsx → 0 matches. 8 consumers refactored: auth.config.ts callbacks.redirect, middleware signInUrl, layout metadataBase, sitemap APP_URL, robots APP_URL, stripe checkout success/cancel, stripe portal returnUrl, p/[username] share meta, ShareCardButton buildShareUrl. |
| AC-R2 | Public legal zero placeholders | **PASS** | rg sweep in 4 legal pages + legal-config + page.tsx for `da completare\|da inserire\|placeholder\|\[Dati\|\[Email\|\[Partita\|\[Indirizzo` → 0 matches. |
| AC-R3 | LEGAL_LAST_UPDATED static literal "9 settembre 2026" no `new Date()` | **PASS** | `legal-config.ts`: `lastUpdatedHuman: "9 settembre 2026"` as const literal. No `buildLegalConfig()` factory IIFE, no `new Date()` call anywhere in legal-config. 4 legal subtitles render that value correctly. |
| AC-R4 | Evolution tappi no overlap + timeline + gold final | **PASS** | TAPPA pill rendered above cards (absolute top -translateY -1/2) with accent color. Desktop: horizontal connector segments (3 of them) at 25% width positions 12.5/37.5/62.5% with evo-ball-travel CSS keyframe travelling neon ball. Mobile: vertical gradient line with chevron between stack. Card 4 Veterano `border-2 border-yellow-400/40 + yellow shadow. OVR badge not overlapped by any pill. |
| AC-R5 | Hero CI anim: 8+ match events W/D/L colors, counter, CSS/Recharts only, no new deps, reduced-motion safe | **PASS** | HeroCILiveDemo component: 8 events (1000→1018→1034→1034→1019→1042→1060→1047→1075). V green +TrendingUp, D gray +Minus, S red +TrendingDown pills. `requestAnimationFrame` cubic ease counter. Recharts LineChart with strokeDasharray/strokeDashoffset progressive draw. `matchMedia(prefers-reduced-motion)` → static final state. No new deps (package.json untouched). Values within career-index [-20,+40] caps. |
| AC-R6 | Stripe 8 audit bullets pass | **PASS** | (1) plan monthly→STRIPE_PRICE_PRO_MONTHLY in checkout L30-32; (2) plan yearly→STRIPE_PRICE_PRO_YEARLY same; (3) guest `!session.userId → router.push("/api/auth/signin?callbackUrl=/pricing")` in StripeButtons L65/L182; (4) auth → POST /api/stripe/checkout Content-Type JSON L68-72; (5) hasActivePro(existingSubscription) → 409 'Abbonamento PRO già attivo' prevents duplicate (L70-75); (6) `window.location.href = data.url` not router push L79-80, portal L135; (7) portal POST /api/stripe/portal same pattern; (8) success /dashboard?pro=success (L106), cancel /pricing?canceled=1 (L107). All bullets confirmed. |
| AC-R7 | Sweep: href=# 0 hits; legal 0 unfinished; TODO/FIXME src 0 hits user-visible | **PASS** | All three ripgrep sweeps returned 0 matches. (Internal code comments: none present at all src-wide.) |
| AC-R8 | tsc exit 0, prisma generate exit 0, clean .next + build exit 0 | **PASS** | `npx.cmd tsc --noEmit` exit 0. `npx.cmd prisma generate` v6.19.3 89ms exit 0. `Remove-Item -Recurse -Force .next` clean. `npm.cmd run build` exit 0. |
| AC-R9 | git public/sw.js restored; diff stat clean | **PASS** | `git restore public/sw.js` executed. Final git-status no longer lists sw.js as modified. Working tree contains 15 M (all src/) + 3 ?? only. Good. |

**Rule AC pass rate: 9/9 PASS**

---

## Rubric (0-3, pass threshold ≥ 2 each)

| RU | Dimension | Score | Rationale |
|---|---|---|---|
| RU1 | Auth URL canonical quality | **3/3** | Single function getAppBaseUrl one source of truth for 8 consumers + auth.config redirect callback. Middleware now uses canonical URL not request.url trust-only for signIn redirect (was root cause of bare www mismatch). Middleware callbackUrl absolute canonical, not relative via origin-inferred. Exact report of URIs required in manual Google Cloud step included. |
| RU2 | Legal genuine production feel | **3/3** | No placeholders. No "non disponibile". Fields with unknown values removed entirely not left blank. Sections numbered coherently across 4 docs. Privacy includes exactly 2.1 Google, 2.2 Solo Career self-reported, 2.3 Stripe PCI, 2.4 Neon/Vercel infra, 2.5 Cookie, 2.6 Log/Sec. Cookie explicitly states NO analytics, NO marketing — names the exact providers that are NOT used (GA/Plausible/Meta/Ads). Termini Foro di Roma (jurisdiction Italia). Only real contact data: calcettoxp@gmail.com + www.calcettoxp.com. Static lastUpdatedHuman literal "9 settembre 2026". No fake GDPR certification claims. |
| RU3 | Evolution section videogame levelling | **3/3** | Novizio → Emergente → Affermato → Veterano color ramp, pill badge placed clean above card. Desktop: 3 neon horizontal connectors with staggered ball-pulse. Final Veterano stage gold accent. Mobile stack with gradient connectors. No overlap visually between TAPPA labels and OVR badges/cards. |
| RU4 | Hero animation V/D/L narrative | **3/3** | 8-match sequence tells clear story: V V P S V V S V — within career-index cap rules. Counter rAF-interpolated (not integer-tick), colored dot at each step, result pill labels, stroke draw animation, loop with pause at end, prefers-reduced-motion respected, no new dependencies. |
| RU5 | Buttons football micro-polish | **3/3** | 4 key CTAs icons assigned correctly: header ACCEDI LogIn, hero primary CREA LA TUA CARRIERA Target, Solo INIZIA ORA PlaySquare (also mobile sticky), secondary hero ChevronRight kept and converted to smooth scrollIntoView no href=#. Hover glow + active press states as-designed. |

**Rubric pass rate: 5/5 at score 3/3 each → 15/15**

---

## Audit: Stripe + Auth entry-point coverage matrix

| Entry point | Action auth logic | Verified? |
|---|---|---|
| header ACCEDI SmartCTA | signIn("google", callbackUrl) auth-aware → dashboard if in | YES |
| hero CREA LA TUA CARRIERA SmartCTA | same | YES |
| mobile sticky INIZIA ORA SmartCTA | same | YES |
| Solo Career CTA | same | YES |
| final CTA | same | YES |
| FreeCTAButton pricing | session.userId ? /dashboard : /api/auth/signin | YES |
| ProCheckoutButton paid | !auth → /api/auth/signin?callbackUrl=/pricing, auth → /api/stripe/checkout POST | YES |
| YearlyCheckoutButton paid | exact same pattern, plan=yearly | YES |
| Guest after Stripe redirect-back | /api/auth/signin?callbackUrl=/pricing → goes to pricing, correct post-login | YES |
| AlreadyProPortalButton | /api/stripe/portal POST → window.location | YES |

**9/9 entry points audited and OK.**

---

## Review History

| Cycle | Result | Notes |
|---|---|---|
| Round 2 cycle 1 | **PASS** | All rule AC PASS 9/9, all rubrics ≥ threshold and score 15/15. No actionable findings. Blockers: zero. |

---

## Verdict

**PASS with distinction.** All rule AC green, all rubrics 3/3.
