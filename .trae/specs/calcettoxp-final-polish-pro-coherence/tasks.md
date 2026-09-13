# CalcettoXP - Pass Finale PRO Coherence - Implementation Plan

## Task 1: Extract shared helpers (plan detect + achievement icon map)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Estrarre `detectPlanFromPriceId(priceId, envMonthly?, envYearly?)` da `src/app/profile/page.tsx` in file condiviso `src/lib/plan.ts` (o dentro entitlements.ts)
  - Estrarre `ICON_MAP` + `IconByName` da `src/app/achievements/page.tsx` in file condiviso `src/components/achievements/AchievementIcon.tsx`
  - Aggiornare `/achievements` a usare la versione condivisa (nessun cambio comportamento)
  - Esportare tipo `PlanKey = 'monthly' | 'yearly' | null`
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `rule` TR-1.1: `detectPlanFromPriceId(STRIPE_PRICE_PRO_MONTHLY)` ritorna `monthly`, `detectPlanFromPriceId(STRIPE_PRICE_PRO_YEARLY)` ritorna `yearly`, `null` altrimenti; Evidence: ispezione output funzione con env dummy
  - `rule` TR-1.2: `/achievements` continua a renderizzare icone correttamente senza cambi visibili; Evidence: confronto rendering prima/dopo (nessuna differenza attesa)
  - `rule` TR-1.3: `IconByName('Footprints')` renderizza componente `<Footprints />`, fallback `Award` per nome sconosciuto; Evidence: import da componente condiviso funziona

## Task 2: Stripe - protezione doppio abbonamento + metadata leggibili
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - In `POST /api/stripe/checkout`:
    - Dopo il check locale hasActivePro, se stripeCustomerId esiste già → chiamare `stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active' })` e verificare lista vuota; se non vuota → 409.
    - Se stripeCustomerId non esiste ancora, dopo la creazione del customer fare lo stesso check lista subscription active.
    - Arricchire `stripe.customers.create` metadata con: userId, name (user.name ?? nickname), email, username (playerProfile.username), plan (requestedPlan).
    - Se customer già esiste: `stripe.customers.update(stripeCustomerId, { metadata: {...aggiorna con dati correnti e plan} })`.
    - `checkoutSession.metadata`: aggiungere name, email, username, plan oltre a userId esistente.
    - NON toccare webhook endpoint URL/handler.
- **Acceptance Criteria Addressed**: AC-1, AC-3
- **Test Requirements**:
  - `rule` TR-2.1: Checkout per utente con subscription active su Stripe ritorna 409 anche se per qualche motivo DB locale non è allineato; Evidence: codice contiene `stripe.subscriptions.list({ customer, status: 'active' })` prima di creare checkout session
  - `rule` TR-2.2: customer/create metadata contiene userId, name, email, username, plan; Evidence: ispezione object metadata passato a stripe.customers.create/update e checkout.sessions.create
  - `rule` TR-2.3: Webhook route NON modificato (stesso endpoint, stesso handler); Evidence: file webhook/route.ts hash contenuto invariato tranne whitespace minori

## Task 3: Pricing - stato piano chiaro Mensile/Annuale + DISDETTO
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1, Task 2
- **Description**:
  - In `src/app/pricing/page.tsx`:
    - Caricare subscription con anche `stripePriceId`, `cancelAtPeriodEnd`, `currentPeriodEnd` (oltre a subscriptionStatus)
    - Usare helper condiviso `detectPlanFromPriceId` per capire mensile/annuale
    - Stato FREE (isPro=false): entrambi pulsanti "SBLOCCA ORA" invariati
    - Stato PRO Mensile attivo:
      - Card Mensile: Badge verde "✅ ATTIVO" (non cliccabile, disabilitato) invece di "HAI GIÀ ATTIVO"
      - Card Annuale: Pulsante giallo con testo "CAMBIA PIANO" (non "SBLOCCA ORA") → onClick apre Customer Portal Stripe (già esistente AlreadyProPortalButton o nuova variante)
    - Stato PRO Annuale attivo: speculare (Annuale badge ATTIVO, Mensile CAMBIA PIANO → portal)
    - Stato cancelAtPeriodEnd=true (ancora isPro=true perché currentPeriodEnd non passato):
      - Banner AlreadyProBanner aggiornato: badge "DISDETTO" invece di "HAI GIÀ PRO", testo "PRO attivo fino al DD/MM/YYYY" con currentPeriodEnd formattato
      - Badge card piano attivo: "📅 DISDETTO (fino DD/MM)"
    - Creare nuova variante bottone `ChangePlanPortalButton` in `StripeButtons.tsx` che apre portal con label "CAMBIA PIANO"
    - Mobile 390/430px: CTA pulsanti pricing con `whitespace-nowrap` e larghezza full, testo non va a capo
- **Acceptance Criteria Addressed**: AC-2, AC-10
- **Test Requirements**:
  - `rule` TR-3.1: FREE renderizza entrambi SBLOCCA ORA, PRO Mensile renderizza ATTIVO+CAMBIA, PRO Annuale renderizza CAMBIA+ATTIVO, cancelAtPeriodEnd mostra data; Evidence: condizioni rendering in page.tsx
  - `rule` TR-3.2: "CAMBIA PIANO" chiama POST /api/stripe/portal e redirect a url ritornato (stesso flusso AlreadyProPortalButton); Evidence: ChangePlanPortalButton condivide logica fetch portal
  - `rule` TR-3.3: Pulsanti Mensile/Annuale hanno `whitespace-nowrap` e larghezza full su mobile; Evidence: classi Tailwind su pulsanti/badge

## Task 4: Icone Lucide nel profilo pubblico /p/[username]
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1
- **Description**:
  - In `src/app/p/[username]/page.tsx`:
    - Importare `IconByName` da componente condiviso
    - Sostituire `{pa.achievement.icon || '★'}` con `<IconByName name={pa.achievement.icon || 'Award'} className="w-5 h-5 text-greenElectric" aria-hidden />`
    - Mantenere wrapper cerchio verde esistente `bg-greenPrimary/15 border-greenPrimary/30 rounded-full w-10 h-10`
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-4.1: Nessuna stringa tipo "Footprints"/"Trophy" renderizzata come testo nel cerchio achievement; Evidence: rimozione `{pa.achievement.icon}` diretto, sostituito con componente JSX IconByName
  - `rule` TR-4.2: Icona di fallback è `Award` (Lucide) non stella unicode; Evidence: default parameter IconByName

## Task 5: PWA banner "Aggiungi alla Home" - refactor componente
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Refactor `src/components/pwa/InstallPWAButton.tsx` (stesso file, update contenuto):
    - Props: `variant?: 'soft' | 'strong'` (default 'soft')
    - Testo variant soft: titolo "Aggiungi CalcettoXP alla Home", sottotitolo "Aprila in un tap, come un'app."
    - Testo variant strong: titolo "La tua carriera è iniziata.", sottotitolo "Tieni CalcettoXP sempre a portata di tap."
    - CTA pulsante: "AGGIUNGI ALLA HOME" (NO parola Installa, NO icona Download - usare icona Smartphone o Plus/Crown)
    - Pulsante dismiss: "Più tardi" invariato
    - Dismiss cooldown: localStorage `calcettoxp-pwa-dismissed` ora salva timestamp; al mount controlla se sono passati >= 7 giorni (1000*60*60*24*7 ms) → se passato, permette di riproporre
    - iOS fallback: se browser è Safari iOS (check userAgent / `navigator.maxTouchPoints > 1 && !window.MSStream && !window.chrome`) e NON è emesso beforeinstallprompt → mostrare invece del prompt nativo: mini-box istruzioni "1. 🔗 Condividi  2. Aggiungi a Home  3. Aggiungi" (testo semplice, icone Share e Plus da lucide). Toggle "Mostra istruzioni iOS" linkabile
    - Standalone check invariato
    - Accessibilità: role=dialog, aria-live=polite, aria-labelledby, aria-label close invariati
  - Aggiornare `src/middleware.ts`: aggiungere `/sw.js`, pattern `/workbox-*.js` alla lista PUBLIC_PREFIXES o PUBLIC_PATHS per permettere accesso SW non autenticato
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-5.1: Nessuna occorrenza della parola case-insensitive "installa" / "install" in testo UI del componente; Evidence: grep componente ritorna 0 occorrenze in JSX testo
  - `rule` TR-5.2: Dismiss ha cooldown >= 7 giorni (confronto Date.now() - savedTimestamp > 7*86400*1000); Evidence: logica condizionale localStorage
  - `rule` TR-5.3: iOS detection fallback presente con istruzioni Condividi>Aggiungi a Home; Evidence: branch if iOS + istruzioni renderizzate
  - `rule` TR-5.4: middleware.ts include `/sw.js` e pattern workbox in whitelist; Evidence: array PUBLIC_PATHS/PREFIXES aggiornato

## Task 6: PWA - integrazione variant soft (homepage) e strong (post prima partita)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 5
- **Description**:
  - Homepage `src/app/page.tsx`: `<InstallPWAButton variant="soft" />` (già presente, solo cambiare prop variant se esistente; mantenere posizione)
  - Dashboard `src/app/dashboard/page.tsx`:
    - `<InstallPWAButton variant="soft" />` come default
    - Aggiungere variante strong trigger: solo se `playerProfile.matchesPlayed === 1` e localStorage `calcettoxp-pwa-strong-shown !== '1'` → passa variant="strong" e dopo dismiss/click imposta flag 'calcettoxp-pwa-strong-shown' (una tantum). Implementazione minima: hook useEffect nel wrapper dashboard o componente PWA che controlla matchesPlayed e decide variant
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-6.1: Dashboard con matchesPlayed=1 attiva variant="strong" con flag one-shot localStorage; Evidence: logica condizionale matchesPlayed + localStorage flag read/write

## Task 7: Record personali PRO avanzati + badge dorati
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - In `src/lib/records.ts`:
    - Aggiungere in PersonalRecord.icon tipo union: `'BEST_7D_WR' | 'BEST_30D_WR' | 'BEST_90D_WR' | 'BEST_7D_CI' | 'BEST_30D_CI' | 'BEST_90D_CI' | 'BEST_SEASON_WINS' | 'BEST_SEASON_ASSISTS'`
    - Calcolare 3 sliding window periods (7/30/90 giorni) da matches: iterare le partite ordinate per data, calcolare per ogni giorno possibile la finestra mobile X giorni, trovare massimo win rate e massimo ΔCI. Alternativa low-cost (se matches.length ≤ 50, come da recentMatchesAll limite 50): calcolare direttamente le 3 finestre fisse "ultimi 7/30/90 giorni" usando la funzione `aggregateForDays` già esistente nella dashboard (estratta in helper condiviso o copiata minimalmente in records.ts). Usiamo approccio low-cost: valori finestra ultimi 7/30/90 giorni già calcolati direttamente da matches (passati come input a computePersonalRecords)
    - Record PRO aggiuntivi (tutti tier=PRO):
      1. `best-7d-winrate`: "Miglior Win Rate ultimi 7gg" → wr7d + sublabel "7 giorni · X partite"
      2. `best-30d-winrate`: "Miglior Win Rate ultimi 30gg" → wr30d
      3. `best-90d-winrate`: "Miglior Win Rate ultimi 90gg" → wr90d
      4. `best-7d-delta-ci`: "Miglior Δ Career Index 7gg" → +N o -N (verde/rosso in UI? valore numerico solo, senza segno con + poi in UI)
      5. `best-30d-delta-ci`: "Miglior Δ Career Index 30gg"
      6. `best-90d-delta-ci`: "Miglior Δ Career Index 90gg"
      7. `best-season-wins`: "Stagione con più vittorie" → nome stagione · X vittorie
      8. `best-season-assists`: "Stagione con più assist" → nome stagione · X assist
    - Mantenere 6 FREE esistenti + 2 vecchi PRO → totali 16 record. Filter finale invariato (isPro || r.tier==='FREE')
  - In `src/components/stats/PersonalRecordsCard.tsx`:
    - Aggiornare ICONS con nuove icone Lucide: BEST_7D_WR=TrendingUp, BEST_30D_WR=TrendingUp, BEST_90D_WR=TrendingUp, BEST_7D_CI=LineChart, BEST_30D_CI=LineChart, BEST_90D_CI=LineChart, BEST_SEASON_WINS=Trophy, BEST_SEASON_ASSISTS=Zap
    - Badge PRO: cambiare da verde `variant=primary` a stile dorato custom (Badge con classe bg-amber-400/20 border-amber-400/40 text-amber-300 oppure creare inline style). Mantenere icona Crown. FREE badge invariato.
    - Colore sfondo/icona record PRO sbloccati: da verde → dorato (bg-amber-400/10 border-amber-400/30 text-amber-300) per differenziare.
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-7.1: computePersonalRecords(isPro=true).length === 16; include record con id best-7d-winrate, best-season-wins, best-season-assists; Evidence: count array + includes ids
  - `rule` TR-7.2: Badge PRO in UI usa colori ambra/giallo, non verde; Evidence: classi Tailwind badge PRO non usano greenPrimary ma amber/yellow
  - `rule` TR-7.3: Record FREE esistenti (6) invariati come id/label/calcolo; Evidence: list prima di quelli nuovi invariata

## Task 8: Badge PRO dorato sezione Periodi 7/30/90
- **Status**: `pending`
- **Priority**: low
- **Depends On**: None
- **Description**:
  - In `src/app/dashboard/page.tsx` sezione Periodi (titolo "Periodi" + sottotitolo "La tua performance su finestre temporali"):
    - Subito dopo l'icona BarChart3 ambra, aggiungere un badge PRO dorato stile CTA upsell (stesso della sezione record: bg-amber-400/20 border-amber-400/40 text-amber-300, Crown icona + "PRO"). Non invasivo, piccolo, allineato a destra o subito accanto al titolo.
    - Messaggio implicito: "analisi disponibile grazie a PRO". Nessun testo aggiuntivo lungo, solo badge.
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `rule` TR-8.1: Header sezione Periodi (per PRO) contiene badge PRO dorato con Crown; Evidence: Badge ambra/Crown presente nel JSX header Periodi. Non compare per FREE (FREE vede CTA upsell invece delle card periodi in ogni caso).

## Task 9: Verifica temi premium NIGHT/ELITE/NEON - persistenza
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Audit/Conferma che il flusso completo funzioni:
    1. `src/app/settings/page.tsx`: passa cardTheme a SettingsClientWrapper corretto
    2. `src/app/settings/SettingsClientWrapper.tsx`: state cardTheme, onChange salvataggio, body PATCH include cardTheme corretto (controllare la funzione saveProfile riga ~119)
    3. `src/app/api/profile/route.ts`: entitlement check FREE_THEMES corretto (CLASSIC only free) → 403 se non PRO e tema premium
    4. `src/app/dashboard/page.tsx`: effectiveCardTheme calcolato con sicurezza (FREE con premium in DB → CLASSIC)
    5. `src/app/p/[username]/page.tsx`: effectiveCardTheme calcolato con ownerIsPro → PlayerCard usa tema corretto
  - Se manca qualche passaggio, aggiungere. (Analisi iniziale dice tutti 4 livelli già implementati - questo task serve a confermare e a correggere solo se qualcosa di rotto)
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `rule` TR-9.1: saveProfile() in SettingsClientWrapper include cardTheme nel body PATCH /api/profile; Evidence: fetch body JSON.stringify({ ..., cardTheme })
  - `rule` TR-9.2: Dashboard e Profilo Pubblico entrambi calcolano effectiveCardTheme con fallback CLASSIC se non autorizzato; Evidence: 2 file con logica gating `freeThemes.includes` o equivalente

## Task 10: Refine responsive 390/430px (CTA pricing + record)
- **Status**: `pending`
- **Priority**: low
- **Depends On**: Task 3, Task 7
- **Description**:
  - Pricing page: assicurarsi che i 3 badge/pulsanti Mensile/Annuale/FREE CTA siano `whitespace-nowrap` su mobile, `w-full`, altezza consistente h-12/h-14, non wrap testo.
  - PersonalRecordsCard: griglia 1-col mobile, record card `p-3`, max-w-full, truncate attivi, icone w-9 (non troppo grandi).
  - Nessun overflow orizzontale su viewport 390px.
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `rubric` TR-10.1: Qualità responsive mobile; scale 1-3; anchors 1=overflow 2=ok ma CTA su 2 righe 3=compatto nessun wrap; threshold >=3; Evidence: ispezione classi `whitespace-nowrap`, `truncate`, `w-full` nei punti critici

## Task 11: Esecuzione verifiche finali tsc + build
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1..10
- **Description**:
  - Eseguire `npx tsc --noEmit` nella root progetto
  - Eseguire `npm run build` nella root progetto
  - Correggere eventuali errori di tipo/build emersi, ripetere finché entrambi exit code 0
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-11.1: `npx tsc --noEmit` exit code 0 (0 errori TS); Evidence: output terminale "Found 0 errors"
  - `rule` TR-11.2: `npm run build` exit code 0 (Next.js build production OK, tutte le routes generate, nessun errore module); Evidence: output terminale "Route (app)" completa e "✓ Compiled successfully"
