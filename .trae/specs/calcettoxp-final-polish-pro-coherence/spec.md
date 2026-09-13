# CalcettoXP - Pass Finale PRO Coherence & Real Features
## Product Requirements Document

## Overview
- **Summary**: Audit e rifinitura finale di CalcettoXP focalizzata su 9 obiettivi concreti: protezione doppio abbonamento Stripe, stato piano chiaro nel pricing, metadata Stripe leggibili, icone trofei profilo pubblico, banner PWA "Aggiungi alla Home", record personali PRO avanzati, badge PRO sezione Periodi, temi premium NIGHT/ELITE/NEON realmente salvabili.
- **Purpose**: Allineare feature promesse a implementazione reale, migliorare coerenza FREE/PRO, aumentare valore percepito PRO, correggere bug visivi (icone trofei, temi card), ottimizzare UX mobile (PWA, pricing).
- **Target Users**: Utenti FREE e PRO di CalcettoXP, team operativo Stripe (backoffice leggibile).

## Goals
1. Garantire max 1 subscription PRO attiva per utente su Stripe (no doppio mensile+annuale)
2. Distinguere chiaramente Mensile vs Annuale nella UI pricing con CTA corrette (ATTIVO / CAMBIA PIANO / SBLOCCA ORA / DISDETTO)
3. Arricchire metadata Stripe (userId, name, email, username, plan) per backoffice leggibile
4. Mostrare icone Lucide reali nel profilo pubblico invece di stringhe testuali ("Footprints", "Trophy")
5. Implementare banner PWA soft (homepage) + forte (dopo prima partita) con supporto Android (native prompt) e iOS (istruzioni Condividi>Aggiungi a Home), no parola "INSTALLA"
6. Aggiungere record avanzati PRO calcolabili da dati esistenti, badge PRO dorati
7. Aggiungere badge PRO dorato nell'header della sezione Periodi 7/30/90
8. Temi premium NIGHT/ELITE/NEON realmente selezionabili e persistenti per utenti PRO (già esistenti ma verificare flusso completo)
9. Verifica finale FREE/PRO + responsive 390/430px + typecheck + build

## Non-Goals
- Refactor architetturale non richiesto
- Redesign generale UI
- Nuove migration DB o nuovi campi oltre a quelli strettamente necessari (nessuno previsto)
- Modifiche a XP, CI, OVR, ranking, trophy engine
- Sistemi PWA complessi (push notification, background sync) oltre a banner installazione
- Nuove metriche/record non calcolabili da dati già presenti

## Background & Context
- Webhook Stripe già configurato correttamente manualmente: `https://www.calcettoxp.com/api/webhook/stripe`, eventi `checkout.session.completed`, `customer.subscription.created`, `invoice.paid` ritornano 200 OK → NON toccare endpoint.
- Sistema trophy V2 implementato con catalogo 50 achievement, mapping icone Lucide completo in `/achievements` ma mancante nel profilo pubblico `/p/[username]`.
- PWA base esistente: `@ducanh2912/next-pwa`, manifest, service worker, `InstallPWAButton.tsx` con beforeinstallprompt (Android) ma usano parola "Installa" e manca supporto iOS + trigger dopo prima partita + dismiss con cooldown.
- Temi card (CLASSIC/NIGHT/ELITE/NEON) già presenti in DB, schema validation, entitlement check in PATCH /api/profile, rendering safety in dashboard/profilo pubblico: da verificare se il flusso Settings→Salva persiste davvero il tema scelto da UI.
- Record attuali: 6 FREE + 2 PRO; Periodi 7/30/90 solo per PRO con CTA upsell per FREE.

## Functional Requirements

### FR-1: Protezione doppio abbonamento Stripe
- **FR-1a**: Endpoint checkout POST /api/stripe/checkout → oltre a check locale `hasActivePro(sub)`, eseguire query Stripe lato customer per verificare non esistano subscription `status=active|trialing` su qualsivoglia priceId (source of truth Stripe). Se presenti → 409.
- **FR-1b**: Customer Portal Stripe già esistente deve essere usato per il cambio Mensile↔Annuale (non nuovo checkout).
- **FR-1c**: Race condition: prima di creare checkout session, marcare un flag in memory/db (es. pendingCheckout su subscription, o meglio usare `payment_behavior=default_incomplete` + subscription transfer_data non necessario, o check Stripe attivo). Minimo: doppio check (DB locale + Stripe remoto).
- **FR-1d**: NON modificare endpoint webhook URL.

### FR-2: Stato piano chiaro nella pagina pricing
- **FR-2a**: Pricing Server Component deve caricare anche `stripePriceId`, `cancelAtPeriodEnd`, `currentPeriodEnd` da subscription oltre a `isPro`.
- **FR-2b**: Helper condiviso `detectPlanFromPriceId` (estratto da profile page in lib condiviso) restituisce `monthly|yearly|null`.
- **FR-2c**: FREE: entrambi i pulsanti mostrano "SBLOCCA ORA".
- **FR-2d**: PRO Mensile attivo: Mensile badge "ATTIVO" (non cliccabile); Annuale pulsante "CAMBIA PIANO" → apre Customer Portal.
- **FR-2e**: PRO Annuale attivo: Annuale badge "ATTIVO"; Mensile pulsante "CAMBIA PIANO" → apre Customer Portal.
- **FR-2f**: Se `cancelAtPeriodEnd=true` e ancora valido (isPro ancora true): banner aggiuntivo "DISDETTO · PRO attivo fino al DD/MM/YYYY" con currentPeriodEnd formattato. Badge pulsante piano attivo: "DISDETTO" invece di "ATTIVO".
- **FR-2g**: Banner "AlreadyProBanner" esistente aggiornato con nome piano (Mensile/Annuale) e, se disdetto, data fine periodo.

### FR-3: Metadata Stripe leggibili
- **FR-3a**: Customer Stripe creation (`stripe.customers.create`) → `metadata` include: `userId`, `name` (da user.name o nickname), `email`, `username` (da PlayerProfile.username), `plan` (monthly/yearly del checkout corrente).
- **FR-3b**: Checkout Session metadata → aggiungere anche `name`, `email`, `username`, `plan` oltre a `userId`.
- **FR-3c**: Aggiornamento customer esistente quando si crea checkout: se stripeCustomerId esiste già, chiamare `stripe.customers.update(stripeCustomerId, { metadata: {...} })` per mantenere dati aggiornati.
- **FR-3d**: Nessun nuovo campo DB.

### FR-4: Icone trofei profilo pubblico
- **FR-4a**: Estrazione ICON_MAP + IconByName in componente/helper condiviso (es. `src/components/achievements/IconByName.tsx` o `src/lib/achievement-icon-map.ts`) riutilizzabile tra `/achievements` e `/p/[username]`.
- **FR-4b**: `/p/[username]` rendering achievement usa IconByName invece di `{pa.achievement.icon || '★'}`. Wrapper stile cerchio verde mantenuto.
- **FR-4c**: Fallback Award se nome icona non mappato.

### FR-5: Banner PWA "Aggiungi alla Home"
- **FR-5a**: Refactor `InstallPWAButton.tsx` → rinominato internamente come `AddToHomeBanner` (stessa export o nuova). Rimuovere parola "INSTALLA" da ogni testo.
- **FR-5b**: Varianti banner:
  - Variant A (soft, homepage): titolo "Aggiungi CalcettoXP alla Home", sottotitolo "Aprila in un tap, come un'app.", CTA "AGGIUNGI ALLA HOME".
  - Variant B (forte, post-prima-partita): titolo "La tua carriera è iniziata.", sottotitolo "Tieni CalcettoXP sempre a portata di tap.", CTA "AGGIUNGI ALLA HOME".
- **FR-5c**: Android: usa beforeinstallprompt esistente → `deferred.prompt()`.
- **FR-5d**: iOS (Safari, no beforeinstallprompt): mostra modal/inline istruzioni passo passo "1. Tocca Condividi 🔗  2. Scorri e tocca 'Aggiungi a Home'  3. Tocca 'Aggiungi'". Icona Share + Plus.
- **FR-5e**: Se già standalone/PWA (`matchMedia standalone` OR `navigator.standalone`): non renderizza nulla.
- **FR-5f**: Dismiss: salva timestamp in localStorage, cooldown 7 giorni prima di riproporre (non permanente).
- **FR-5g**: Trigger variant B: lato dashboard (o hook condiviso) che controlla matchesPlayed === 1 (prima partita) + localStorage per one-shot. Implementazione minima: prop `variant="soft" | "strong"` al componente.
- **FR-5h**: Middleware: aggiungere `/sw.js` e `/workbox-*.js` alla whitelist se non già presenti.

### FR-6: Record personali PRO avanzati
- **FR-6a**: Aggiungere record PRO calcolabili da dati esistenti in `computePersonalRecords()`:
  1. `best-7d-winrate` : Miglior Win Rate 7 giorni (calcola su sliding window o sul periodo 7d esistente, prendendo il massimo) — PRO
  2. `best-30d-winrate` : Miglior Win Rate 30 giorni — PRO
  3. `best-90d-winrate` : Miglior Win Rate 90 giorni — PRO
  4. `best-7d-delta-ci` : Miglior Δ Career Index 7 giorni — PRO
  5. `best-30d-delta-ci` : Miglior Δ Career Index 30 giorni — PRO
  6. `best-90d-delta-ci` : Miglior Δ Career Index 90 giorni — PRO
  7. `best-season-wins` : Stagione con più vittorie — PRO
  8. `best-season-assists` : Stagione con più assist — PRO
  (Totale nuovi record PRO: 8. Totale complessivo: 6 FREE + 10 PRO = 16)
- **FR-6b**: Badge PRO dorati: in PersonalRecordsCard badge PRO usa colori dorati (bg giallo/ambra, testo nero/giallo) invece del verde `variant=primary` attuale.
- **FR-6c**: Mantenere tutti i 6 record FREE esistenti inalterati.

### FR-7: Badge PRO sezione Periodi
- **FR-7a**: Nel box/header della sezione Periodi 7/30/90 (solo quando renderizzata per utenti PRO), aggiungere un badge PRO dorato visibile (stile oro/ambra con Crown, non verde) subito accanto al titolo "Periodi".
- **FR-7b**: Messaggio implicito: "questa analisi è disponibile grazie a PRO". Testo non invasivo. Layout invariato.

### FR-8: Temi premium NIGHT/ELITE/NEON realmente salvabili
- **FR-8a**: Audit già completato: flusso SettingsClientWrapper→PATCH /api/profile→DB→PlayerCard già implementato con 4 livelli di sicurezza. Confermare solo che il salvataggio persista dopo refresh (logica già presente: settings legge da DB, PATCH salva, dashboard legge da DB con effectiveCardTheme safety).
- **FR-8b**: Profilo pubblico: conferma che usa effectiveCardTheme con ownerIsPro check (già implementato).
- **FR-8c**: Fallback FREE→CLASSIC mantenuto (già implementato, non distruggere cardTheme salvato).
- **FR-8d**: Se il render locked FREE mostra già preview temi premium, mantenere; altrimenti mantenere stato attuale.

### FR-9: Controllo finale & verifica
- **FR-9a**: Verifica FREE: tutte le CTA FREE funzionano, gating rispettato, temi premium bloccati, record PRO nascosti, periodi nascosti con CTA upsell.
- **FR-9b**: Verifica PRO Mensile: pricing distingue mensile attivo, annuale cambia piano; temi premium selezionabili; record completi; periodi visibili.
- **FR-9c**: Verifica PRO Annuale: come sopra ma scambiato mensile/annuale.
- **FR-9d**: Gestione disdetta: cancelAtPeriodEnd=true mostra banner DISDETTO + data fine, pulsante ATTIVO→DISDETTO, ancora ha accesso PRO (hasActivePro ritorna true finché currentPeriodEnd non passato).
- **FR-9e**: CAMBIA PIANO → Customer Portal esistente.
- **FR-9f**: Doppio abbonamento: endpoint checkout ritorna 409 se subscription attiva (DB + check Stripe).
- **FR-9g**: PWA mobile: banner visibile su Android e iOS, dismiss funziona, no in standalone.
- **FR-9h**: Icone trofei pubblici: rendering Lucide, no testo "Footprints"/"Trophy".
- **FR-9i**: Temi premium: salvataggio persiste dopo refresh, profilo pubblico rispettato, FREE fallback CLASSIC.
- **FR-9j**: Responsive 390px / 430px: nessun overflow orizzontale, CTA pricing su una riga, card record leggibili.
- **FR-9k**: `npx tsc --noEmit` passa.
- **FR-9l**: `npm run build` passa.

## Non-Functional Requirements
- **NFR-1**: Nessuna modifica a XP/CI/OVR/ranking/trophy-logic.
- **NFR-2**: Nessuna migration DB.
- **NFR-3**: Compatibilità FREE/PRO invariata rispetto a oggi (no regressioni).
- **NFR-4**: Endpoint webhook `/api/webhook/stripe` NON modificato (URL e firma invariati).
- **NFR-5**: Tutte le CTA hanno loading state e gestione errore esistente mantenuta.
- **NFR-6**: Accessibilità: ARIA corretta per nuovi banner PWA (role=dialog, aria-live, aria-label close).
- **NFR-7**: No duplicazione inutile di codice (ICON_MAP condivisa, detectPlan condiviso).
- **NFR-8**: Stile premium coerente: badge PRO dorati in Records e Periodi, NON verdi.

## Constraints
- **Technical**: Next.js 15 App Router, Prisma, Stripe API 2025-03-31.basil, date-fns, lucide-react, shadcn/ui custom (Button, Badge, Card).
- **Business**: Abbonamenti Stripe source of truth. Webhook URL manuale immutabile.
- **Dependencies**: `@ducanh2912/next-pwa` esistente, Libreria Stripe esistente.

## Assumptions
- Le variabili d'ambiente `STRIPE_PRICE_PRO_MONTHLY` e `STRIPE_PRICE_PRO_YEARLY` sono definite in produzione.
- Il Customer Portal Stripe è configurato lato Dashboard con i due price abilitati per l'upgrade/downgrade.
- Service Worker viene servito correttamente in produzione (middleware whitelist aggiunta).
- matchesPlayed in PlayerProfile è popolato correttamente per trigger variant B PWA.

## Acceptance Criteria

### AC-1: Nessun doppio abbonamento Stripe
- **Type**: `rule`
- **Given**: Utente FREE apre checkout Mensile e Annuale in due tab, o utente già PRO tenta checkout
- **When**: Endpoint `/api/stripe/checkout` viene chiamato
- **Then**: Se l'utente ha già una subscription active/trialing su Stripe per qualsiasi price, ritorna HTTP 409 "Abbonamento PRO già attivo"
- **Pass Condition**: check locale hasActivePro + check remoto `stripe.subscriptions.list({ customer: stripeCustomerId, status: 'active' })` ritorna lista vuota per permettere checkout
- **Evidence**: Ispezione codice `checkout/route.ts` + test curl manuale simulando utente con subscription attiva

### AC-2: Stato piano chiaro pricing
- **Type**: `rule`
- **Given**: Utente FREE, PRO Mensile, PRO Annuale, PRO con cancelAtPeriodEnd=true
- **When**: Viene renderizzata `/pricing`
- **Then**:
  - FREE → entrambi SBLOCCA ORA
  - PRO Mensile → Mensile badge ATTIVO (non cliccabile), Annuale CAMBIA PIANO (clicca → portal)
  - PRO Annuale → Annuale badge ATTIVO, Mensile CAMBIA PIANO (→ portal)
  - Disdetto → banner "DISDETTO · PRO attivo fino DD/MM/YYYY", badge pulsante "DISDETTO"
- **Pass Condition**: 4 stati renderizzati correttamente con dati stripePriceId, cancelAtPeriodEnd, currentPeriodEnd
- **Evidence**: Ispezione rendering condizionale in pricing page.tsx

### AC-3: Metadata Stripe leggibili
- **Type**: `rule`
- **Given**: Utente con User.name, User.email, PlayerProfile.username
- **When**: Viene creato customer e checkout session
- **Then**: Customer metadata contiene userId, name, email, username, plan; Checkout metadata contiene userId, name, email, username, plan. Se customer esisteva, metadata aggiornati.
- **Pass Condition**: tutti e 5 i campi presenti in create e update
- **Evidence**: Ispezione codice checkout route.ts

### AC-4: Icone Lucide nel profilo pubblico
- **Type**: `rule`
- **Given**: Achievement con icon="Footprints" o "Trophy" sbloccato
- **When**: Viene renderizzata `/p/[username]` sezione trofei
- **Then**: Viene mostrata icona Lucide `<Footprints />` o `<Trophy />` nel cerchio verde, non la stringa testuale
- **Pass Condition**: `{pa.achievement.icon}` sostituito da `<IconByName name={...} />`
- **Evidence**: Ispezione rendering in /p/[username]/page.tsx + ICON_MAP condivisa esistente

### AC-5: PWA banner "Aggiungi alla Home"
- **Type**: `rubric`
- **Dimension**: Completezza UX banner PWA e rispetto vincoli (no INSTALLA, Android native, iOS istruzioni, cooldown dismiss, standalone skip)
- **Scale**: 0-2
- **Anchors**: 0 = banner usa "Installa" o manca iOS; 1 = banner ha testo corretto ma manca iOS/cooldown; 2 = tutte le condizioni rispettate (testo senza INSTALLA, Android prompt, iOS istruzioni, dismiss 7gg, standalone non mostra, due varianti soft/strong)
- **Pass Threshold**: >= 2
- **Evidence**: Ispezione componente PWA + middleware whitelist

### AC-6: Record avanzati PRO + badge dorati
- **Type**: `rule`
- **Given**: computePersonalRecords chiamato con isPro=true
- **When**: Viene restituito l'array
- **Then**: Contiene almeno 10 record (6 FREE + 8 nuovi PRO + 2 vecchi PRO = 16, filtrati a 16 se isPro=true) inclusi best win rate 7/30/90d, best ΔCI 7/30/90d, best season wins/assists; badge PRO in UI PersonalRecordsCard usa colori dorati (non verde)
- **Pass Condition**: count array lenght + nuovi id presenti (best-7d-winrate, best-season-wins, etc.) + badge PRO colore oro controllato
- **Evidence**: Ispezione records.ts e PersonalRecordsCard.tsx

### AC-7: Badge PRO dorato sezione Periodi
- **Type**: `rule`
- **Given**: Utente PRO su dashboard
- **When**: Viene renderizzata sezione Periodi 7/30/90
- **Then**: Accanto al titolo "Periodi" è presente un badge PRO visibile con stile dorato (ambra/giallo, Crown icona, non verde)
- **Pass Condition**: Badge PRO dorato presente nel rendering della sezione Periodi per PRO
- **Evidence**: Ispezione rendering in dashboard page.tsx sezione periodi

### AC-8: Temi premium salvataggio persistente
- **Type**: `rule`
- **Given**: Utente PRO in Settings sceglie tema ELITE e salva
- **When**: Refresh pagina Dashboard e visita Profilo Pubblico da visitatore esterno
- **Then**: Dashboard card usa tema ELITE; Profilo pubblico usa tema ELITE (ownerIsPro=true); FREE con cardTheme=ELITE in DB fallback a CLASSIC senza distruggere valore salvato
- **Pass Condition**: flusso Settings legge cardTheme→PATCH salva→Dashboard legge effectiveCardTheme→PlayerCard usa THEME_CONFIG[tema]
- **Evidence**: Verifica 4 punti di sicurezza già implementati + settings save cardTheme incluso nel body PATCH (ispezione codice)

### AC-9: Typecheck e build puliti
- **Type**: `rule`
- **Given**: Codice modificato
- **When**: `npx tsc --noEmit` e `npm run build` vengono eseguiti
- **Then**: Entrambi i comandi ritornano exit code 0, nessun errore
- **Pass Condition**: exit code 0 per entrambi
- **Evidence**: Output terminale dei comandi

### AC-10: Responsive mobile 390/430px
- **Type**: `rubric`
- **Dimension**: Qualità responsive sezione pricing e record su mobile (390px iPhone 12 Pro / 430px iPhone 14 Pro Max)
- **Scale**: 1-3
- **Anchors**: 1 = overflow orizzontale o CTA su 2 righe; 2 = nessun overflow ma CTA non ottimizzato; 3 = layout compatto, CTA una riga, card record leggibili, badge visibili
- **Pass Threshold**: >= 3
- **Evidence**: Ispezione classi responsive grid/w-whitespace/nowrap in pricing e PersonalRecordsCard

## Open Questions
- [ ] Nessuna. Ambito e limiti definiti esplicitamente.
