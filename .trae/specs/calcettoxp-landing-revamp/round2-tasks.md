# CalcettoXP — Round 2 Implementation Tasks

Parent Spec: `round2-spec.md` in same directory. All tasks traceable.
Date: 2026-09-09.

---

## Task 1: Canonical Base URL + Google OAuth URL Wires (AC-R1, AC-RU1)

**Priority**: high
**Status**: pending
**Depends**: none

**Scope / What to do**:
1. Create shared URL helper `src/lib/app-url.ts` (new file if missing; otherwise write) exporting `getAppBaseUrl()` that returns
   `AUTH_URL || NEXTAUTH_URL || NEXT_PUBLIC_APP_URL || "https://www.calcettoxp.com"`, trailing slash stripped, always www default.
2. Update `src/auth.config.ts`:
   - import getAppBaseUrl. Use it to make `redirectProxyUrl` or callback URL; keep `trustHost: true`; verify pages.signin still /signin.
3. Update `src/middleware.ts`: construct signInUrl using getAppBaseUrl (do not rely purely on request.url; fallback to canonical URL when request.url is inconsistent).
4. Search and replace remaining hardcoded defaults fallbacks across:
   - `src/app/layout.tsx` → use getAppBaseUrl for siteUrl
   - `src/app/sitemap.ts` → use
   - `src/app/robots.ts` → use
   - `src/app/api/stripe/checkout/route.ts` → use
   - `src/app/api/stripe/portal/route.ts` → use
   - `src/components/share/ShareCardButton.tsx` → use
   - `src/app/p/[username]/page.tsx` → use
5. Zero remaining bare `|| 'https://calcettoxp.com'` non-www literal defaults left anywhere in codebase after T1.

**Local TR (rule)**:
TR T1.1: grep `'https://calcettoxp.com'` (bare non-www default literal) → 0 matches in production path files.
TR T1.2: 1 single function `getAppBaseUrl` source file; all 8 consumers import it.
TR T1.3: SmartCTA uses signIn("google", { callbackUrl }) exactly as before, no change; middleware fallback to canonical www callback.

**Test Requirements**:
- Compile TS check (build will confirm in later task.)

---

## Task 2: Legal Static Last Updated + Placeholder Purge + Sections Rewrite (AC-R2, AC-R3, AC-RU2)

**Priority**: high
**Status**: pending
**Depends**: none (independent)

**Scope / What to do**:
1. Edit `src/lib/legal-config.ts`:
   - Remove runtime `buildLegalConfig()` / new Date() logic entirely.
   - Set literal constant `LEGAL_LAST_UPDATED = '9 settembre 2026'`; corresponding `lastUpdated='2026-09-09'`
   - Use only confirmed factual data ONLY:
     ```
     appName: 'CalcettoXP'
     domain: 'www.calcettoxp.com'
     canonicalRoot: 'https://www.calcettoxp.com'
     contactEmail: 'calcettoxp@gmail.com'
     territory: 'Italia'
     ```
   - services object preserved: Google OAuth, Neon, Vercel Hosting, Stripe Payments, Vercel Blob
   - DELETE ownerName, vatId, address, companyName, gdpr.controllerContactEmailPlaceholder fields.
   - privacyContact = `calcettoxp@gmail.com` (real email, no placeholder). Use generic.

2. Rewrite 4 legal pages: DELETE any rows referencing deleted fields or `[..placeholder]`. Do NOT write "non disponibile". If data does not exist, remove entire `<li>`/paragraph/line.
   - `/privacy/page.tsx`: Remove Section 1 items P.IVA, Indirizzo, Dati identificativi placeholders. Keep section 1 short: state clearly that CalcettoXP is the service operated under Italian territory; contact for privacy is calcettoxp@gmail.com + domain www.calcettoxp.com. Keep GDPR Blockquote but remove the placeholder reference. No "100% GDPR compliant." claims allowed.
   - `/termini/page.tsx`: Section 9 references → drop P.IVA, address etc. Use only confirmed data.
   - `/cookie-policy/page.tsx`: Section 6 titolare → only confirmed info. Strict necessary cookies only narrative (auth, session Stripe — no analytics ads cookies).
   - `/disclaimer/page.tsx`: §7 contatti → only confirmed email/domain info.
   - All 4 pages share subtitle "Ultimo aggiornamento: 9 settembre 2026".

**Local TR (rule)**:
TR T2.1: grep `da completare|da inserire|\[Dati|\[Email|\[Partita|\[Indirizzo|placeholder` inside `src/app/{privacy,termini,cookie-policy,disclaimer}/*.tsx` and `src/lib/legal-config.ts` → 0 matches.
TR T2.2: LEGAL_LAST_UPDATED constant in config is literal string, not new Date() derived.
TR T2.3: No "Partita IVA" heading/text anywhere if no value → field gone, not "in attesa" style.

---

## Task 3: Card Evolution Timeline Overlap Fix + Flow Animation (AC-R4, AC-RU3)

**Priority**: high
**Status**: pending
**Depends**: none

**Scope / What to do**:
1. Rewrite `page.tsx` evolution area.
   - Move TAPPA pill outside overlap: render a timeline header ABOVE each card.
   - Mobile: Vertical stacked (TAPPA 1 → card → line pulse → TAPPA 2).
   - Desktop: Horizontal timeline with animated connector.
   - Traveling green pulse along the connection line segments between stages. Use CSS keyframe translate-x inside wrapper.
   - Tappa badge has stage number + level name mini text.
   - Final Veterano card: upgrade border/yellow accent subtly gold-ish.
   - Keep existing evolutions array values. Change layout, not the data.

**Constraints**: No SWC template className patterns inside JSX. Use local const for interpolated classes.

**Local TR (rule)**:
TR T3.1: Overlap absolute inset positioning fixed; TAPPA badge not overlapping any OVR/card border, sitting clean above.
TR T3.2: Connection line between stages (horizontal for desktop, vertical for mobile) with travelling neon dot / flow-pulse animation.
TR T3.3: No `className={\`` templates with arbitrary brackets anywhere in new/edited section.

---

## Task 4: Hero Animated Career Index Demo (AC-R5, AC-RU4)

**Priority**: high
**Status**: pending
**Depends**: none

**Scope**:
1. Delete or upgrade `MiniCIIndex(player)` function. The new component lives INSIDE the HERO RIGHT column near demo player card. Call it HeroCILiveDemo.
2. Hardcoded demo sequence events (within career-index.ts caps ±20/+40 total change):

```
START 1000
1 VITTORIA +18 → 1018  (15 win + 3 goal role = within cap)
2 VITTORIA +16 → 1034
3 PAREGGIO 0 → 1034
4 SCONFITTA -15 → 1019
5 VITTORIA +23 → 1042
6 VITTORIA +18 → 1060
7 SCONFITTA -13 → 1047
8 VITTORIA +28 → 1075
```

That's 8 events, sum stays within cap.
3. UI: counter increments per step; coloured dot (green up / gray draw / red down) + label pill "VITTORIA +18", …
4. Recharts Area or Line + stroke-dasharray stroke offset CSS keyframes for line draw. Or pure SVG polyline with strokeDasharray animated.
5. Loop every ~9-10s with pause before reset.

**Constraints**: New dep ❌. Use CSS, useState/useEffect, Recharts already installed.

**Local TR (rule)**:
TR T4.1: 8 events; CI counter updates; each pill coloured correctly.
TR T4.2: No npm package added. package.json/package-lock untouched (verifiable with git diff).
TR T4.3: prefers-reduced-motion safe: reduced motion → show static final state with no anim.

---

## Task 5: Button / Micro UI Game-ish Polish (AC-RU5)

**Priority**: medium
**Status**: pending
**Depends**: none

**Scope**:
1. 4 key CTAs: add football Lucide icons from existing installed set (not new):
   - ACCEDI → `LogIn` icon
   - CREA LA TUA CARRIERA → `Zap` (existing) OR `Target` appropriate
   - SOLO CAREER "INIZIA ORA" → `PlaySquare` existing
   - PRO buttons → Crown (existing, OK)
2. Hover: neon glow intensified, focus ring clean, press active:scale-95/98.

**TR (rubric)**: RU5 overall >= 2 threshold.

---

## Task 6: Stripe Flow Audit + Demo Players Consistency (AC-R6, FR-5)

**Priority**: high
**Status**: pending
**Depends**: T1 run

**Audit code without running live**:
- [ ] monthly button plan `monthly` → env `STRIPE_PRICE_PRO_MONTHLY`
- [ ] yearly button plan `yearly` → env `STRIPE_PRICE_PRO_YEARLY`
- [ ] guest not authenticated `router.push("/api/auth/signin?callbackUrl=/pricing")` ✓
- [ ] auth fetch POST `/api/stripe/checkout` JSON body
- [ ] `hasActivePro` existingSubscription → 409 no double create ✓
- [ ] `window.location.href = data.url` not pushState ✓
- [ ] portal POST `/api/stripe/portal` same pattern ✓
- [ ] success `?pro=success` dashboard; cancel `pricing?canceled` ✓

**Demo players**: verify non-linear ciData arrays preserved; optionally add tooltip result labels if possible (WIN/DRAW/LOSS).

**TR (rule)**:
TR T6.1: All Stripe 8 audit bullets above confirmed.
TR T6.2: 4 demo players, non-linear arrays still intact, 10+ pts each, at least 1 dip per.

---

## Task 7: Mandatory Sweep Searches + Git + Build Pipeline (AC-R7, AC-R8, AC-R9)

**Priority**: high
**Status**: pending
**Depends**: T1, T2, T3, T4, T5, T6 all pass

**Run in order**:

1. **Search sweep**:
   ```
   rg -n "href=\"#\"" src/app/page.tsx  → expect 0
   rg -n "da completare|da inserire|\[Dati|\[Email|\[Partita|\[Indirizzo|placeholder" src/{app,lib,components}  → expect 0 user-visible matches (comments internal OK)
   rg -n "TODO|FIXME" src/ → only allowed in non-user code/comments
   ```

2. **Git**:
   `git status --short`
   `git rev-parse HEAD`

3. **TS strict**:
   `npx.cmd tsc --noEmit` → exit 0

4. **Prisma**:
   `npx.cmd prisma generate` → exit 0

5. **Clean build**:
   `Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue`
   `npm.cmd run build` → exit 0, inspect full output.

6. **Git restore PWA artifact**:
   `git restore public/sw.js` (if present in working tree as build artifact only, not code change).

7. **Final git state**:
   `git status --short`
   `git diff --stat`

**TR (rule)**:
All subcommands exit as required above.
