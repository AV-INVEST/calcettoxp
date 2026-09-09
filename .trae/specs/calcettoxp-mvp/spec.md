# CalcettoXP MVP - Product Requirements Document

## Overview
- **Summary**: CalcettoXP è un'applicazione web production-ready che trasforma ogni partita di calcetto in una carriera personale. Gli utenti registrano risultati e performance delle partite giocate dal vivo, guadagnano XP, fanno evolvere la propria scheda giocatore, aumentano o diminuiscono il proprio Career Index e costruiscono una carriera calcistica amatoriale nel tempo.
- **Purpose**: Creare un'esperienza mobile-first divertente, coinvolgente e premium che incentivi gli utenti a registrare ogni partita tramite un sistema di progressione gamificato (XP, livelli, OVR, Career Index, achievement).
- **Target Users**: Giocatori amatoriali di calcetto a 5 che giocano partite reali e vogliono tracciare la propria performance nel tempo. Singolo utente già funzionante; multiplayer verrà aggiunto successivamente.

## Goals
- Implementare il flusso core: Google Login → Onboarding → Dashboard → Registra Partita → Progressione (XP/Career Index/OVR/Achievement)
- Creare una landing page spettacolare, mobile-first, con identità visiva calcistica-gaming premium
- Implementare sistema di autenticazione esclusivamente con Google OAuth via Auth.js
- Implementare algoritmi di Career Index, OVR, XP/Livelli, Attributi Scheda
- Dashboard con scheda giocatore, grafico Career Index, statistiche, partite recenti
- Flusso di registrazione partita < 20 secondi, con validazioni anti-cheat
- Sistema di achievement database-driven
- Sistema di stagioni personali
- Sistema di abbonamenti Stripe (FREE/PRO mensile €3,90 / annuale €29,90) con entitlement check server-side
- Architettura pronta per futuro multiplayer
- PWA support

## Non-Goals
- Multiplayer completo (solo preparazione architetturale e UI bloccata)
- Inviti, squadre, matchmaking, ranking verificato (futuro)
- Email OTP, magic link, provider auth esterni oltre Google OAuth
- Statistiche Opta-style (tackle, intercette, tiri, dribbling, ecc.)
- Import storico massivo di partite
- Upload avatar custom in MVP (usa foto Google)
- CMS esterno
- Modifiche OVR manuali (deriva solo da Career Index)

## Background & Context
- Dominio: calcettoxp.com
- Deploy: Vercel
- Database: Neon PostgreSQL (Prisma ORM)
- Pagamenti: Stripe Checkout + Customer Portal + Webhook
- Il prodotto deve essere estremamente economico nella fase MVP
- Solo utente singolo già completamente funzionante
- Contenuti UI in ITALIANO; codice, variabili, nomi tecnici in INGLESE

## Functional Requirements

### FR-1: Tech Stack Setup
- Next.js latest stable, App Router, TypeScript
- Tailwind CSS, Prisma ORM, Neon PostgreSQL
- Auth.js con Google OAuth (solo provider Google)
- Stripe Checkout + Customer Portal + Webhook
- Recharts per grafici, Lucide per icone
- PWA manifest e supporto base

### FR-2: Landing Page
- Hero: Logo CalcettoXP, headline "Trasforma ogni calcetto nella tua carriera.", subheadline, CTA primario "CREA LA TUA CARRIERA GRATIS", CTA secondario "SCOPRI COME FUNZIONA"
- Hero include scheda giocatore animata preview + grafico mini Career Index
- Sezione "Come funziona" 3 step: Gioca → Registra → Evolvi
- Sezione "Example Player Career" con demo statistiche e grafico
- Sezione "Player Card Evolution" (progressione OVR)
- Sezione "Achievements" con badge visivi
- Sezione "Solo Career vs Multiplayer"
- Sezione "Pricing" FREE / PRO (mensile €3,90 + annuale €29,90 con risparmio)

### FR-3: Autenticazione & Onboarding
- Login esclusivamente con "Continua con Google" (Auth.js)
- Primo login: se non esiste PlayerProfile → redirect a onboarding
- Onboarding wizard in 6 step: nickname, data nascita/età, nazionalità, città, piede preferito, ruolo principale (+ secondario opzionale)
- Alla fine onboarding: rivelazione animata prima scheda, valori iniziali (Level 1, XP 0, Career Index 1000, OVR ~60)
- Blocco accesso dashboard finché onboarding non completo

### FR-4: User Dashboard (mobile-first)
- Bottom navigation mobile: Home, Partite, + (centrale prominente → Registra partita), Statistiche, Profilo
- Header: "Ciao, {nome}. Pronto per la prossima partita?"
- Scheda giocatore principale (nickname, ruolo, OVR, LV, attributi reali: FORM, IMPACT, RESULTS, SCORING, EXPERIENCE, CONSISTENCY)
- Career Index: valore attuale, variazione, trend ultimi 30g, grafico Recharts
- Quick stats cards: Partite, Vittorie, Gol, Assist, Win Rate
- Recent matches
- Prossimo achievement progress
- Current season info
- Multiplayer Card bloccata con "In arrivo"

### FR-5: Registra Partita Flow
- Una schermata mobile o stepper breve
- Data: default oggi, max 24h nel passato, no date future, max 3 partite/giorno
- Risultato: VITTORIA / PAREGGIO / SCONFITTA + punteggio squadra tua vs avversaria (0-30 per squadra)
- Ruolo giocato: POR / DIF / CEN / ATT (default ruolo primario)
- Gol: 0-15, Assist: 0-10
- Se ruolo=POR: chiedi "Hai mantenuto la porta inviolata?" (SI/NO)
- Note opzionali max 250 char (non influenzano punteggio)
- Dopo salvataggio: schermata animata PARTITA REGISTRATA con: risultato, punteggio, gol, assist, +XP, Career Index delta, OVR delta, level up animazione se avvenuto, unlock achievement se avvenuto
- Edità partita possibile per max 15 minuti → poi locked (lockedAt)
- isVerified=false, verificationType=SELF_REPORTED

### FR-6: Career Index Algorithm
- Iniziale: 1000
- Moduli dedicati lib/career-index.ts (facile ribilanciamento futuro)
- Base risultato: WIN +15, DRAW +3, LOSS -10
- Contributo ruolo: ATT goal+3 assist+2; CEN goal+2 assist+3; DIF goal+2 assist+2; POR win bonus +5, draw bonus +2, clean sheet +8
- Cap massimo positivo: +40 / partita; cap massimo negativo: -20 / partita
- Storico ogni partita in CareerIndexHistory (before/after/change)

### FR-7: OVR System
- Deriva esclusivamente da Career Index (nessuna modifica manuale)
- Mappatura liscia: CI800→OVR50, CI1000→OVR60, CI1200→OVR70, CI1400→OVR80, CI1600→OVR90
- Min OVR 40, Max OVR 99

### FR-8: Level & XP
- Livello mai decresce
- XP: played match +50, win +30, draw +15, goal +5, assist +5, POR clean sheet +15 (con cap per partita)
- XP requirement crescente per livello (es. L1:0, L2:100, L3:250, L4:450, ...)
- Funzioni riutilizzabili lib/xp-levels.ts

### FR-9: Card Attributes
- Non attributi FIFA fake. Attributi reali derivati dai dati:
  - FORM (ultime 5 partite)
  - IMPACT (risultati + goal/assist pesati per ruolo)
  - RESULTS (win rate)
  - SCORING (gol normalizzati per ruolo)
  - EXPERIENCE (partite giocate e XP)
  - CONSISTENCY (varianza performance partite recenti)
- Ogni 0-99, calcolo server-side

### FR-10: Career Graph
- Recharts LineChart stile financial chart
- X: partite / date; Y: Career Index
- Colore verde trend positivo, rosso negativo
- Tooltip: data, avversario (opzionale), risultato, CI before, CI after, variazione
- Mobile responsive

### FR-11: Seasons
- Stagioni (es. "Stagione 2026/27")
- Ogni partita appartiene a una stagione
- Riepilogo stagione: partite, W/D/L, gol, assist, win rate, CI inizio/fine/picco, OVR inizio/fine
- Storico seasoni archiviate

### FR-12: Achievement System
- Database-driven (facile aggiungere nuovi)
- Achievement FREE e PRO
- Esempi inclusi: FIRST_MATCH, FIRST_WIN, FIRST_GOAL, HAT_TRICK, FIVE_GOALS, ON_FIRE, UNBEATEN_5, UNBEATEN_10, TEN_WINS, FIFTY_WINS, MATCHES_10/50/100, GOALS_10/50/100, CAREER_INDEX_1200/1500, LEVEL_10/25/50
- Progress bars dove applicabile
- Check unlock dopo ogni partita

### FR-13: Anti-cheat / Data Quality
- Max 3 partite / giorno calendario
- Data partita max 24h nel passato, no future
- Gol max 15, assist max 10, punteggio max 30/squadra
- Lock partita dopo 15 min (non modificabile)
- Prevenzione submit duplicato

### FR-14: Multiplayer Preparation
- DB schema include Team, TeamMember, MatchParticipant, MatchConfirmation (non usati in MVP)
- Dashboard mostra Multiplayer Card bloccata "In arrivo"
- Match ha isVerified e verificationType

### FR-15: Subscriptions & Entitlement
- Stripe prodotti: PRO MONTHLY €3.90/mese, PRO YEARLY €29.90/anno
- Stripe Checkout + Customer Portal
- Stripe webhook per aggiornamento stato abbonamento
- Subscription model: stripeCustomerId, stripeSubscriptionId, stripePriceId, subscriptionStatus, currentPeriodEnd
- Entitlement check SEMPRE server-side, mai fidarsi del client
- Entitlement layer riutilizzabile: canAccessAdvancedStats(), canCustomizeCard(), canAccessFullHistory(), canAccessSeasonComparison()

### FR-16: PRO Feature Gating
- FREE buono per creare abitudine: registra partite, scheda, stats base, XP/livelli, achievement base, CI, grafico limitato, stagione corrente
- PRO unlocks solo analytics/personalizzazione (MAI XP/CI/OVR/ranking):
  - statistiche avanzate, storico completo, grafici avanzati, analisi 7/30/90g, record personali, stats per ruolo/periodo/risultato, migliori streak, andamento stagioni, card premium, personalizzazione card, achievement PRO, insight forma, confronto stagioni, badge PRO

### FR-17: Player Profile Page
- Foto profilo Google, nickname, città, nazionalità, età, piede preferito, ruolo primario
- Level, OVR, Career Index, totale partite, gol, assist, win rate, achievement, season history
- Subscription status
- Pulsante "MODIFICA PROFILO"
- Ruolo primario cambiabile max 1 volta ogni 30 giorni

## Non-Functional Requirements
- **NFR-1 Visual Style**: Premium football gaming. Palette: bg #070A08, bg sec #0E1410, card #111713, green #22C55E, electric #7CFF6B, white #F8FAF8, muted #8B968D, danger #EF4444. Geometria campo sottile decorativa (non campo letterale). No gradienti SaaS blu generici, no glassmorphism eccessivo, no grafica calcettosa infantile.
- **NFR-2 Mobile First**: Tutte le UI progettate e testate prima su mobile; bottom nav; layout responsive.
- **NFR-3 Speed**: Registrazione partita < 20 secondi. Next.js App Router ottimizzato, rendering efficiente.
- **NFR-4 Simplicity**: Non sovraccaricare di stats. Solo info che l'utente ricorda dopo una partita.
- **NFR-5 Lingua**: Contenuti UI in ITALIANO; codice/commenti/schema/componenti in INGLESE.
- **NFR-6 MVP Economics**: Estremamente economico su Neon/Stripe/Vercel durante MVP.
- **NFR-7 Scalabilità**: Architettura pulita pronta per espansione multiplayer e feature future.

## Constraints
- **Technical**: Next.js latest, App Router, TypeScript, Tailwind, Prisma, Auth.js (solo Google OAuth), Stripe, Vercel, Recharts, Lucide. NO Resend/Clerk/Supabase/Firebase/CMS esterni/email OTP/magic link.
- **Business**: Pagamenti non influenzano XP/CI/OVR/ranking in alcun modo. Solo analytics/personalizzazione premium.
- **Dependencies**: Google Cloud OAuth credenziali, Stripe API keys, Neon PostgreSQL URL.
- **Legal**: Parte 2 includerà pagine legali; MVP non include.

## Assumptions
- Le API keys (Google OAuth, Stripe, Neon DB URL) verranno configurate tramite .env dall'utente prima del deploy.
- MVP non richiede share, public profile, SEO avanzato (verranno in Parte 2).
- L'utente comprende che dati sono self-reported; nessuna pretesa di "verificato".

## Acceptance Criteria

### AC-1: Project bootstrap con tech stack completo
- **Type**: `rule`
- **Given**: Repository vuoto
- **When**: Eseguita l'installazione iniziale
- **Then**: Next.js latest + App Router + TypeScript + Tailwind + Prisma configurati; package.json include dipendenze Auth.js, @prisma/client, stripe, recharts, lucide-react; configurazione base presente
- **Pass Condition**: `npm install && npm run build` non produce errori fatali; Prisma genera client senza errori
- **Evidence**: Output build, struttura file corretta

### AC-2: Prisma schema con tutti i modelli
- **Type**: `rule`
- **Given**: Database Neon pronto
- **When**: `npx prisma migrate dev` eseguito
- **Then**: Modelli presenti: User, Account, Session, VerificationToken, PlayerProfile, Match, CareerIndexHistory, PlayerSeason, Achievement, PlayerAchievement, Subscription; future-ready: Team, TeamMember, MatchParticipant, MatchConfirmation
- **Pass Condition**: Migrazione applicata senza errori; `npx prisma db push` valido; relazioni corrette
- **Evidence**: File prisma/schema.prisma + output migrazione

### AC-3: Auth.js esclusivamente Google OAuth
- **Type**: `rule`
- **Given**: Google OAuth credenziali in env
- **When**: Utente clicca "Continua con Google"
- **Then**: Login/Auth completati via Google; nessun altro provider disponibile; sessione gestita Auth.js
- **Pass Condition**: Flusso login funziona; route /api/auth/providers restituisce solo google
- **Evidence**: Config auth.ts + screenshot/registrazione flusso

### AC-4: Onboarding wizard e blocco dashboard
- **Type**: `rule`
- **Given**: Utente appena registrato senza PlayerProfile
- **When**: Tenta accesso dashboard
- **Then**: Reindirizzato a onboarding; dopo completamento 6 step + rivelazione carta → redirect a dashboard; dashboard non accessibile finché onboarding non completo
- **Pass Condition**: Middleware/route guard blocca utenti non onboarded; onboarding salva PlayerProfile
- **Evidence**: Screenshots onboarding + redirect corretto

### AC-5: Landing page completa in italiano
- **Type**: `rule`
- **Given**: Utente non autenticato
- **When**: Visita /
- **Then**: Hero, Come funziona 3 step, Example Player Career, Player Card Evolution, Achievements, Solo Career vs Multiplayer, Pricing (FREE/PRO €3,90/m e €29,90/a)
- **Pass Condition**: Tutte sezioni presenti; testi in italiano; visual premium; nessun placeholder
- **Evidence**: Screenshot desktop + mobile

### AC-6: Visual style premium football gaming
- **Type**: `rubric`
- **Dimension**: Fedeltà visiva a palette e stile specificati
- **Scale**: 1-5
- **Anchors**: 1 = look SaaS generico/colori sbagliati; 3 = palette corretta ma poco originale; 5 = identità visiva CalcettoXP unica, palette #070A08/#22C55E/#7CFF6B usate correttamente, sottili geometrie campo, eleganza dark gaming
- **Pass Threshold**: >= 4
- **Evidence**: Screenshots + ispezioni classi Tailwind

### AC-7: Mobile first + bottom nav
- **Type**: `rubric`
- **Dimension**: Qualità dell'esperienza mobile
- **Scale**: 1-5
- **Anchors**: 1 = layout desktop solo stretto; 3 = usable mobile ma bottom nav mancante/imperfetta; 5 = progettato mobile-first, bottom nav 5 elementi con + centrale prominente, dimensioni touch adeguate
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot 375px width

### AC-8: Registra partita rapido con validazioni
- **Type**: `rule`
- **Given**: Utente autenticato onboarded
- **When**: Compila "Registra partita"
- **Then**: Valida: data ≤ oggi e ≥ oggi-24h; max 3 partite/giorno; 0≤gol≤15; 0≤assist≤10; punteggio 0-30; POR solo chiede clean sheet; salvataggio crea Match + aggiorna PlayerProfile (cached aggregate) + CareerIndexHistory + PlayerAchievement check + XP/level
- **Pass Condition**: Inserimento valido funziona; dati non validi bloccati con messaggio; Match creato con valori corretti
- **Evidence**: Log creazione match + test validazione fallita

### AC-9: Career Index, OVR, XP algoritmi corretti
- **Type**: `rule`
- **Given**: Codice lib/career-index.ts, lib/ovr.ts, lib/xp-levels.ts
- **When**: Simulate partita (VINTA + ATT 2gol + 1assist)
- **Then**: CI change: base+15 + 2*3 + 1*2 = +23 (cap +40 quindi 23); OVR ricalcolato da CI via mapping liscio; XP: 50+30+2*5+1*5 = 95; livello aggiornato se soglia superata
- **Pass Condition**: Test/simulazione restituisce valori attesi; CI min/max cap rispettati
- **Evidence**: Unit test o script di simulazione output

### AC-10: Scheda giocatore con 6 attributi reali
- **Type**: `rule`
- **Given**: Dati partite registrati
- **When**: Visualizza scheda su dashboard
- **Then**: Visualizza attributi: FORM, IMPACT, RESULTS, SCORING, EXPERIENCE, CONSISTENCY (0-99 ciascuno); attributi calcolati server-side
- **Pass Condition**: 6 attributi presenti, valori plausibili, formula eseguita lato server
- **Evidence**: Codice di calcolo + screenshot scheda

### AC-11: Career Index graph Recharts
- **Type**: `rule`
- **Given**: N ≥ 3 CareerIndexHistory entries
- **When**: Dashboard caricata
- **Then**: LineChart mostra CI nel tempo, X=date/match, tooltip mostra data, risultato, before, after, delta; verde se trend positivo, rosso se negativo; responsive
- **Pass Condition**: Grafico renderizza; tooltip dati corretti; mobile responsive
- **Evidence**: Screenshot grafico con ≥ 3 punti

### AC-12: Sistema achievement database-driven
- **Type**: `rule`
- **Given**: Achievement popolati nel DB
- **When**: Registrata prima partita / partita tripletta / 5 gol / ecc.
- **Then**: PlayerAchievement creato e associato; pagina mostra badge e progress
- **Pass Condition**: Almeno FIRST_MATCH, FIRST_WIN, FIRST_GOAL, HAT_TRICK, MATCHES_10, GOALS_10, CAREER_INDEX_1200, LEVEL_10 implementati e verificabili
- **Evidence**: DB row create dopo azioni + screenshot sezione achievement

### AC-13: Sistema stagioni
- **Type**: `rule`
- **Given**: Stagione corrente assegnata
- **When**: Partita registrata
- **Then**: Associazione PlayerSeason creata/aggiornata; stagione mostra partite, W/D/L, gol, assist, CI inizio/fine/picco, OVR inizio/fine
- **Pass Condition**: Partite aggregate correttamente per stagione
- **Evidence**: Row in DB + pagina stagione con dati corretti

### AC-14: Lock partita dopo 15 min + anti-cheat
- **Type**: `rule`
- **Given**: Partita creata
- **When**: Sono passati >15 min
- **Then**: lockedAt impostato; modifica UI disabilitata; max 3 partite/giorno rispettato
- **Pass Condition**: API PATCH match rifiuta se locked; creazione rifiuta 4a partita giorno
- **Evidence**: Test API + messaggio errore

### AC-15: Stripe Checkout + abbonamento + entitlement
- **Type**: `rule`
- **Given**: Utente FREE, Stripe configurato
- **When**: Utente clicca "SBLOCCA PRO" su pricing mensile
- **Then**: Redirect a Stripe Checkout €3.90/mese; pagamento completato → webhook aggiorna Subscription; controllo server-side canAccessAdvancedStats() ritorna true
- **Pass Condition**: Checkout funziona; webhook ricevuto; stato aggiornato; PRO feature accessibili; FREE feature sempre disponibili
- **Evidence**: Screenshot Stripe Checkout + DB Subscription row + feature visibility

### AC-16: Entitlement check server-side
- **Type**: `rule`
- **Given**: Client manipola stato per fingere PRO
- **When**: Richiama endpoint PRO-only
- **Then**: Server verifica Subscription e blocca se FREE
- **Pass Condition**: Endpoint restituisce 403/401 per utente non PRO
- **Evidence**: Test API chiamata senza abbonamento

### AC-17: Pagina profilo + cambio ruolo 30gg
- **Type**: `rule`
- **Given**: Profilo giocatore
- **When**: Utente tenta cambio ruolo primario due volte in 30g
- **Then**: Secondo tentativo rifiutato; mostra data prossimo cambio possibile
- **Pass Condition**: Limite rispettato; profile page mostra tutti i dati
- **Evidence**: Codice validazione + tentativo fallito

### AC-18: PWA support base
- **Type**: `rule`
- **Given**: App buildata
- **When**: Lighthouse controlla PWA
- **Then**: Manifest presente, icone, installabile, almeno service worker base o strategia equivalente Next.js PWA
- **Pass Condition**: Manifest.json presente; installabile
- **Evidence**: next.config configurazione + file manifest

### AC-19: Match post-save animated result screen
- **Type**: `rubric`
- **Dimension**: Qualità animazione e feeling di reward
- **Scale**: 1-5
- **Anchors**: 1 = solo testo statico; 3 = alcuni numeri che cambiano; 5 = animazione XP che sale, CI before → after con transizione, eventuale level up animato, achievement unlock visivo, soddisfacente
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot/registrazione

### AC-20: Architettura scalabile e pronta per multiplayer
- **Type**: `rule`
- **Given**: Codice
- **When**: Analisi struttura cartelle
- **Then**: Separazione chiara app/api/components/lib; schema Prisma include modelli multiplayer (Team, TeamMember, MatchParticipant, MatchConfirmation) senza dipendenze breaking; layer entitlement e servizi centralizzati
- **Pass Condition**: Revisione struttura + schema conferma
- **Evidence**: Struttura cartelle + schema.prisma

## Functional Requirements (PARTE 2 - Completamento MVP)

### FR-18: Public Player Profiles (/p/[username])
- Username unico pubblico per ogni giocatore (3-20 chars, lowercase, lettere/numeri/underscore)
- Pagina pubblica: /p/[username] con informazioni PUBBLICHE solo: photo, nickname, username, city (se abilitata), nazionalità, piede, ruolo primario, PlayerCard, OVR, level, Career Index, partite, vittorie, gol, assist, win rate, achievement (solo pubblici), current season, andamento CI recente
- MAI esporre: email, data di nascita esatta, Google ID, stripe DB IDs, settings privati
- Profili PUBBLICO / PRIVATO, enforced server-side. Messaggio PRIVATO: "Questo profilo è privato."
- Lista nomi riservati: admin, api, dashboard, settings, signin, pricing, privacy, termini, cookie, calcettoxp, terms, impressum, support, faq, blog, shop, store, app, login, auth, logout, register, signup, home, about, contact + altri comuni

### FR-19: Username management
- Validazione server-side: unique + regex + length + nomi riservati
- Cambio username max 1 volta ogni 30 giorni (lastUsernameChangeAt field)
- Username inseribile in onboarding (o creato da nickname all'inizio, modificabile poi)
- Validazione asincrona disponibilità durante settings / onboarding

### FR-20: Share Profile / Card
- "Condividi la mia card" pulsante in dashboard e pagina profilo
- Usa navigator.share Web Share API su mobile se disponibile
- Fallback: pulsante "Copia link" con Clipboard API
- URL esempio: https://calcettoxp.com/p/andreavivace
- Testo share: "Guarda la mia carriera su CalcettoXP ⚽"
- Nessun servizio di sharing esterno a pagamento

### FR-21: Settings (/settings)
- 6 sezioni:
  - Account: Google account (email, foto)
  - Profilo: username + modifica, profile visibility (PUBBLICO/PRIVATO), city visibility (mostra/nascondi città in profilo pubblico)
  - Abbonamento: FREE/PRO stato, upgrade CTA a Stripe checkout, Gestisci abbonamento a Stripe portal
  - Privacy: Cookie preferences (riapri banner)
  - Dati: Esporta dati JSON, Elimina account (con conferma esplicita)
  - Sessione: Logout
- UI pulita dark/gaming, mobile first, sezioni card separate

### FR-22: Account Deletion reale
- Conferma con password alternativa non necessaria: conferma testo "ELIMINA DEFINITIVAMENTE" e doppia conferma
- Prima di cancellare: se subscription PRO attiva → CANCELLA abbonamento Stripe via API stripe.subscriptions.cancel(customer.subscriptions.data[0].id) OPPURE Stripe customer.sub.cancel (in modo che non continui a pagare)
- Cancellazione/anomizzazione dati CalcettoXP owned: PlayerProfile + Match + CareerIndexHistory + PlayerSeason + PlayerAchievement + Session + Account del provider? (minimo, calcolo: Cascade da User). Attenzione: Account e Session con Cascade ma User.email, account provider... Prisma onDelete Cascade su relazioni → cancellazione User dovrebbe eliminare tutto
- Cancellazione asincrona, messaggio successo, logout immediato

### FR-23: Data Export JSON autenticato
- "Scarica i miei dati" genera file JSON contente: profile, matches, careerIndexHistory, seasons, playerAchievements, preferences
- MAI esportare OAuth secrets (Account) + Stripe secret + dati altri utenti
- Trigger: fetch endpoint /api/data/export che restituisce application/json attachment Content-Disposition attachment; filename="calcettoxp-export-data.json"

### FR-24: Legal Pages (italiano solo)
- /privacy : Privacy Policy IT, accurata per servizi usati: Google OAuth, Neon PostgreSQL, Vercel hosting, Stripe pagamenti, Vercel Blob (se usato), profili pubblici, statistiche auto-dichiarate, cancellazione account, esportazione dati, cookie, diritti GDPR-style. NON inventare dati aziendali (IVA, indirizzi, nome società). Usa placeholders sostitubili prima del lancio
- /termini : Termini e Condizioni d'uso generali. Dichiarazione calcettoxp.com è servizio ricreativo. Nessun dato è "verificato" in MVP (solo self-reported). Solo future multiplayer/verificate... Attenzione: NON INVENTARE società
- /cookie-policy : Cookie policy con categorie Necessari/Analitici/Marketing. Spiega cookie Auth.js (necessari), cookie Stripe (necessari in checkout), cookie analytics se attivabili. Facoltativo.
- /disclaimer : ENFASI dichiarazione "Le statistiche della Solo Career sono inserite direttamente dall'utente. Career Index, OVR e attributi card sono metriche ricreative CalcettoXP. NON sono statistiche federali ufficiali, misure certificate, valutazioni da osservatori professionistici, garanzie di abilità calcistica. Statistiche future multiplayer verificate rimangono nettamente separate dalle statistiche Solo Career self-reported."
- File config **src/lib/legal-config.ts** centralizzato con placeholder name, contact email, company info facilmente aggiornabili PRIMA del lancio. Nessun riferimento a persona/società vera nel codice.

### FR-25: Cookie Consent VERO
- 3 categorie: Necessari, Analitici, Marketing
- Necessari SEMPRE attivi
- Pulsanti: ACCETTA TUTTI / RIFIUTA NON NECESSARI / PERSONALIZZA
- Script opzionali (es analytics, marketing) MAI caricati PRIMA del consenso utente. NESSUNO script aggiunto se non si usano tools oggi → banner funziona anche se Analitici/Marketing oggi non caricano nulla (framework pronto per aggiunte future)
- Preferenze salvate in cookie 1 anno max o localStorage (cookie `calcettoxp-consent`)
- Banner riapribile da: footer (link "Impostazioni cookie") e Settings → Privacy "Gestisci preferenze cookie" + pulsante
- Design integrato CalcettoXP dark/green electric

### FR-26: PWA Audit + Completamento
- Valido manifest.json già presente (esistente Part 1)
- Standalone mode corretto
- Theme color #22C55E corretto, bg #070A08
- Metadata mobile (viewport, apple-touch-icon support)
- Supporto Apple: link apple-touch-icon + status bar style black-translucent
- Service Worker appropriato (PWA @ducanh2912 plugin già configurato; SW attivo in produzione, disattivato dev)
- Icone 192px e 512px PNG (generate placeholder se non presenti, min SVG o PNG piccoli per default)
- Sottile CTA installazione "Aggiungi CalcettoXP alla schermata Home" solo se browser supporta `beforeinstallprompt` event e utente non ha già installato; NON popup aggressivi (mostra piccolo banner in dashboard footer settings un tanto ogni tot sessioni o pulsante in settings)

### FR-27: Mobile First Audit (375/390/430 px)
- Audit OGNI pagina: NO horizontal overflow
- Large touch targets min 44x44px
- NO tiny text (min 14px per leggibile, 12px accettabile per etichette piccole)
- Form one-hand friendly (centrati nella parte centrale/inferiore schermo)
- Grafici Recharts responsive al 100%
- Cards readable (padding adeguato)
- NO desktop-only layouts
- Safe-area support (env(safe-area-inset-*) per notch iPhone moderni) in globals.css e layout bottom
- Bottom nav padding-bottom safe-area
- Registrazione partita deve rimanere ~20 secondi (stessa UI, nessun campo aggiuntivo)
- Mobile authenticated nav: Home / Partite / + / Statistiche / Profilo (confermato già Part 1, mantenere)

### FR-28: SEO
- Homepage title: "CalcettoXP - Trasforma ogni calcetto nella tua carriera"
- Homepage description IT: "Registra le tue partite di calcetto, fai evolvere la tua card, guadagna XP e costruisci la tua carriera calcistica personale."
- Canonical URLs (Next.js metadata default o /)
- OpenGraph immagini
- sitemap.xml + robots.txt in /app o /public statico (Next.js 15 supporto)
- metadata semantico headings (h1 uno per pagina)
- Public profile /p/[username] METADATA DINAMICO: title "{nickname} su CalcettoXP | OVR {overall} - LV. {level}", description con info pubbliche + og:url calcettoxp.com/p/{u}
- Profili PRIVATI e pagine autenticate (dashboard, settings, matches, stats, profile, pricing si, achievements si se pubblico accessibile ma SEO ? NO. Achievement e pricing indicizzabili; ma dashboard, settings, matches, new, profile utente corrente NON indicizzare: X-Robots-Tag noindex in response o metadata robots { index: false, follow: false })

### FR-29: Open Graph / Social Preview
- Homepage OG: title CalcettoXP + "Trasforma ogni calcetto nella tua carriera."
- Se implementabile pulitamente con Next.js App Router generateImageMetadata ImageResponse: crea OG images profili PUBBLICI con nickname, ruolo, OVR, level, Career Index, branding CalcettoXP. MAI esporre info private
- Fallback se troppo complesso: card OG statica con logo branding

### FR-30: PRO Monetization Audit (NON pay-to-win)
- Controllo attivo: MAI nessun pagamento aumenta XP, OVR, CI, ranking, performance
- FREE mantiene: profilo, registra partite, XP, livelli, card core, CI, achievement base, statistiche base (tutto quanto basta per creare abitudine)
- PRO sblocca solo engagement: statistiche avanzate, storico completo, analisi 7/30/90 giorni, grafici avanzati, record personali, confronto stagioni, insight forma avanzati, temi card premium, achievement PRO avanzati, personalizzazione card ricca
- Upsell contestuali: NO popups isterici. Solo: in stats sezione bloccata "Passa a PRO per analisi avanzate", in settings abbonamento, in pricing page
- Prezzi invariati: PRO Monthly €3,90 / mese, PRO Yearly €29,90 / anno

### FR-31: Card Customization Temi PRO
- Se fattibile pulitamente: PRO only 4 temi VISIVI (nessuna modifica stats):
  - CLASSIC: tema base Part 1 (dark default con verde)
  - NIGHT: blu navy scuro + cyan electric
  - ELITE: nero profondo + oro/giallo gradienti sottili
  - NEON: multicolor glow neon green/purple electric (tenue, non overkill)
- MAI copiare design EA Sports FIFA. Original CalcettoXP visual identity.
- Tema memorizzato in PlayerProfile.cardTheme field. Apply CSS variables o props a PlayerCard.

### FR-32: Next Goal Dashboard Module
- Dashboard aggiunge sezione "PROSSIMO OBIETTIVO" → UN SOLO obiettivo primario scelto automaticamente
- Candidati: 50 gol / 10 vittorie / Level 10 / Career Index 1200 / 50 partite / HAT_TRICK / 100 partite / CI 1500 / Level 25
- Calcola il più vicino al target non ancora sbloccato (min (target-progress)/target o similar)
- Mostra: nome obiettivo, progress bar, X/Y, data stimata o nota motivazionale
- NO troppi obiettivi (1 solo primario per non sovraccaricare)

### FR-33: Personal Records
- Calcolare e mostrare record:
  - Career Index più alto (picco all-time)
  - OVR più alto
  - Striscia vittorie più lunga
  - Striscia imbattuta più lunga (W+D consecutive)
  - Più gol in una partita (top match)
  - Più assist in una partita
  - Stagione migliore (peak CI o end CI)
- Record avanzati (alcuni) possono essere PRO gating (FREE vede top 3 + banner PRO)
- Modello: calcolo runtime da Match aggregati o tabella separata PlayerRecord (opzionale, MVP runtime OK)

### FR-34: Achievements Audit + PRO Achievements
- Audit esistenti (FREE) sono OK. Aggiungere alcuni Achievements PRO (nel seed aggiornato):
  - MATCHES_250 (250 partite) tier PRO
  - MATCHES_500 (500 partite) tier PRO
  - CAREER_INDEX_1800 tier PRO
  - GOALS_250 tier PRO
  - Level 75 tier PRO
- Regola: PRO mai GRANT automatici; utente deve guadagnarli anche se PRO
- Controllo: modifica match durante finestra 15 minuti → RICONTROLLA achievements in PATCH route in modo safe NO duplicati (delete achievements guadagnati con vecchi dati se non più validi? Oppure ricalcola e upsert in modo idempotente. Sempre senza duplicati).

### FR-35: Multiplayer Future Only (strict separation)
- MANTENERE architettura strict separation: SOLO CAREER self-reported personale vs MULTIPLAYER/RANKED future verificato competitivo
- MAI mixare automaticamente self-reported stats in ranking competitivo futuro
- UI continua a mostrare solo "MULTIPLAYER - IN ARRIVO". NESSUN giocatore falso, NESSUNA partita finta, NESSUNA social proof finta
- Database: mantenere modelli Team/MatchParticipant/MatchConfirmation + TrustScore, RankedCard o campo verified in PlayerProfile separato per futuro (non usare in MVP)

### FR-36: Security Audit Mutazioni Server-Side
- Audit TUTTE le mutazioni (POST/PATCH/DELETE):
  - Valori autoritativi (XP, level, CI change, CI, OVR, aggregate wins/goals, achievement unlock, subscription status) MAI accettati dal client
  - Client solo submit: result, score, role, goals, assists, clean sheet, date, notes (raw input match)
  - Tutto il resto calcolato server-side
- Ownership check OVUNQUE: match.xxx può essere modificato solo da giocatore proprietario
- Stripe webhook signature verificata SEMPRE (esistente Part 1)
- Secrets env MAI esposti client-side (controllo NEXT_PUBLIC only per publishable key)
- XSS: Next.js React escape, Content Security Policy headers opzionali in next.config (se già non presenti)

### FR-37: Match Rules (stricter enforcement)
- Confermare e ri-audit limiti server side:
  - max 3 matches / calendario giorno ✓ Parte1 presente
  - no future matches ✓
  - max 24h registrazione ✓
  - goals max 15, assists max 10 ✓
  - team score 0-30 ✓
  - edit 15 min lock ✓
  - cambio ruolo primario max 1 / 30 giorni ✓
- MAI fidarsi solo di HTML input limits; tutti i check con Zod e validazioni runtime su API

### FR-38: Performance Audit
- Server Components dove appropriato (dashboard, landing, matches list, public profile, stats, profile)
- Minimo JS client (solo componenti "use client" dove necessario: form, animazioni, grafici, buttons share, toast)
- Chart Recharts caricati dinamicamente o sospesi: dynamic import with ssr:false se serve (Recharts compatibile)
- Immagini ottimizzate: next/image, dimensioni corrette; PWA icone appropriate
- Query Prisma efficienti: index esistenti (Part1), N+1 evitati con include appropriato, PAGINAZIONE liste lunghe (partite, achievements) se >100 (cursor o page skip/take limit 50)
- MAI ricalcolare carriera intera per ogni dashboard request; usare cached counters in PlayerProfile (stesso Part 1)
- Solo DB Neon PostgreSQL; NO Redis, Firebase, Supabase, DB extra

### FR-39: Empty & Error States ITALIANO branded
- Messaggi ITALIANO lucidati, mai messaggi raw Prisma/Stripe/Server verso utente
- 404 branded personalizzata: "Fuori dal campo." + "La pagina che stai cercando non esiste." + CTA "TORNA ALLA HOME". Cartella app/not-found.tsx (Next 15)
- Empty: "La tua carriera è appena iniziata. Registra la tua prima partita e scopri come cambia la tua card."
- Errori form: chiari in italiano (es. "Questo username è già utilizzato.", "Questa partita non può più essere modificata.")
- 500 e errori gravi: pagina /app/error.tsx boundary "Ops, qualcosa è andato storto. Riprova tra poco."

### FR-40: Accessibility Audit
- HTML semantico: <header>, <nav>, <main>, <section>, <article>, <footer>
- Label associate a tutti gli input (htmlFor + id)
- Tastiera: tutti gli elementi interattivi raggiungibili Tab; focus ring visibile
- Contrasto testo/background verificato palette: white #F8FAF8 on #070A08 contrasto OK; muted #8B968D sufficiente in spessore o font-size
- ARIA labels dove icone senza testo (buttons share, nav icons)
- Supporto prefers-reduced-motion: disabilita animazioni XP/count-up se impostato; globals.css media query reduce motion
- MAI interazioni solo per colore (es. +verde = positivo, ma affiancare anche ▲ ▼ icone frecce come già esistono)

### FR-41: Runtime Validation (Node.js se disponibile)
- Se Node installato: esegui npm install / npx prisma generate / npm run build / npm run lint; fix ERRORI reali (TS, import, Prisma, Auth.js, Stripe, middleware, boundaries, PWA, rotte dinamiche, Recharts, hydration)
- MAI claim testato runtime se solo statico. Se Node NON disponibile in ambiente, dichiarare blocked e prerequisito per l'utente

## Constraints Updated (PARTE 2)
- Technical: NO Resend/Clerk/Firebase/Supabase/Auth0/CMS/API pagate extra / DB extra. Stack invariato Next.js + TS + Tailwind + Prisma + Neon + Auth.js Google + Stripe + Vercel + Vercel Blob SOLO se necessario + Recharts + Lucide.
- Business: pagamenti NON influenzano XP/CI/OVR/ranking/performance in alcun modo.
- Dependencies: stesse di Part 1 + possibilmente @vercel/og per OG images se scelto.
- Legal: testi placeholder reali in legal-config.ts; nessun nome società/IVA inventati.

## Assumptions Updated (PARTE 2)
- Node.js 18+ installato dall'utente finale per npm install prima di avviare build/dev
- Utente configura NEXT_PUBLIC_APP_URL=https://calcettoxp.com in produzione (aggiunta a env.example)
- Cookie analytics/marketing non implementati in MVP; banner cookie framework funzionante ma attivi solo Necessari per default
- Card themes PRO Classico/Night/Elite/Neon CSS variabili sufficienti (no immagini pesanti)

## Acceptance Criteria (PARTE 2)

### AC-21: Username unico + validazioni riservati / 30g
- **Type**: `rule`
- **Given**: Nuovo utente si registra e salva username
- **When**: tenta username <3 chars o maiuscole o spazi o trattini o nome riservato o nome già esistente
- **Then**: API rifiuta 400 con errore italiano + Utente non può cambiare due volte in 30g
- **Pass Condition**: API /api/username-check o in settings PATCH validano, campi lastUsernameChangeAt presenti, nomi riservati controllati
- **Evidence**: Codice validazione + test tentativi falliti

### AC-22: Public profile /p/[username] dati pubblici corretti + privacy enforced
- **Type**: `rule`
- **Given**: Due utenti, profilo X pubblico, profilo Y privato, Z non autenticato
- **When**: Z visita /p/X, /p/Y
- **Then**: /p/X mostra PlayerCard, nickname, username, OVR, LV, CI, partite W/G/A win rate, achievements pubblici, current season, trend CI; email nascosta; data nascita nascosta; /p/Y mostra solo "Questo profilo è privato." + logo + back to home; no data leak
- **Pass Condition**: route GET pubblica renderizza correttamente; NO campi privati nella risposta HTML o JSON server
- **Evidence**: Codice route + screenshot entrambi i casi

### AC-23: Share card con Web Share + copy link fallback
- **Type**: `rule`
- **Given**: Utente autenticato con username
- **When**: Clic "Condividi la mia card"
- **Then**: Se mobile navigator.share → share con URL calcettoxp.com/p/{u} + testo "Guarda la mia carriera su CalcettoXP ⚽"; altrimenti Clipboard API copia link + toast "Link copiato negli appunti!"
- **Pass Condition**: Entrambi percorsi implementati; NO servizi esterni share
- **Evidence**: Codice share component

### AC-24: Pagina Settings 6 sezioni IT
- **Type**: `rule`
- **Given**: Utente loggato
- **When**: visita /settings
- **Then**: Sezioni presenti: Account (Google), Profilo (username + visibility + city visibility), Abbonamento (FREE/PRO + checkout + portal), Privacy (riapri cookie), Dati (Esporta JSON + Elimina account), Sessione (Logout)
- **Pass Condition**: Tutte e 6 le sezioni UI presenti con contenuti appropriati; tutti pulsanti linkano a route corrette
- **Evidence**: Screenshot e codice route

### AC-25: Account Deletion cancella dati + Stripe sub
- **Type**: `rule`
- **Given**: Utente con Subscription PRO attiva + partite + CI history
- **When**: Conferma eliminazione account
- **Then**: Chiamata Stripe cancel subscription (o almeno rimuovi auto-renew se customer cancel via portal oppure API delete); User + tutti relazioni cancellati; redirect a / con messaggio "Account eliminato. Grazie per aver giocato con CalcettoXP."
- **Pass Condition**: DELETE /api/account esiste, controlla ownership, cancella Stripe prima, poi DB. MAI lascia utente pagante dopo eliminazione
- **Evidence**: Codice endpoint + controllo status subscription

### AC-26: Data Export JSON senza secrets
- **Type**: `rule`
- **Given**: Utente autenticato
- **When**: Click "Scarica i miei dati"
- **Then**: Download attachment JSON con profile, matches array, careerIndexHistory, seasons, achievements/player achievements, preferences (username visibility ecc.). MAI include Account.oauth tokens, Stripe secrets, env, dati altri utenti
- **Pass Condition**: Keys esportate correttamente; zero sensitive keys
- **Evidence**: Esempio JSON export chiavi corrette

### AC-27: Pagine legali 4 URL + centralizzazione config
- **Type**: `rule`
- **Given**: Utente non autenticato
- **When**: Visita /privacy, /termini, /cookie-policy, /disclaimer
- **Then**: 4 pagine caricano, stile coerente CalcettoXP dark, testi italiano, privacy menziona accuratamente Google OAuth + Neon + Vercel + Stripe + Public profiles + Self-reported stats + Deletion + Export + Cookie/GDPR-style rights; disclaimer dichiarazione non-ufficiale chiara; legal-config.ts centrale per name/company/placeholder
- **Pass Condition**: 4 routes risposta 200; contenuti appropriati; NO fake società/indirizzi/IVA inventati
- **Evidence**: Percorsi file e contenuti

### AC-28: Cookie Consent VERO 3 categorie + riapertura
- **Type**: `rule`
- **Given**: Nuovo visitatore, zero cookie
- **When**: Carica prima pagina
- **Then**: Banner visibile, 3 categorie (Necessari ON non disattivabile, Analitici/Marketing togglable in "Personalizza"), bottoni ACCETTA TUTTI / RIFIUTA NON NECESSARI / PERSONALIZZA; scelta salvata in cookie calcettoxp-consent 1y max; footer e Settings privacy permettono Riapri banner; script non-necessari (se esistessero oggi) non caricati prima del consenso
- **Pass Condition**: UI banner presente, logica memorizzazione, pulsanti riapertura; oggi Necessari soli attivi default, framework estendibile
- **Evidence**: Codice banner + stati localStorage/cookie

### AC-29: PWA completo: manifest standalone + icone + Apple meta + SW produzione + install CTA sottile
- **Type**: `rule`
- **Given**: Build production
- **When**: Lighthouse PWA audit
- **Then**: manifest valido standalone; 192+512 icone (o placeholder PNG se non artefatto disponibili; almeno esistenza file); link apple-touch-icon; status-bar-style; SW registrato in produzione; "Aggiungi alla home" CTA mostra se evento beforeinstallprompt disponibile
- **Pass Condition**: Tutti i checklist PWA minimi
- **Evidence**: next.config, public files, metadata

### AC-30: Mobile audit 375/390/430 nessun overflow + bottom nav safe area
- **Type**: `rubric`
- **Dimension**: Qualità mobile-first compliance
- **Scale**: 1-5
- **Anchors**: 1 = overflow orizzontale, bottoni piccoli, text illegibile; 3 = usable ma alcuni edge case; 5 = zero overflow 3 widths, touch ≥44px, padding safe, bottom nav funziona form one-hand friendly, registrazione <20s
- **Pass Threshold**: >= 4
- **Evidence**: Screenshots viewport 375/390/430 + CSS safe-area rules

### AC-31: SEO sitemap robots + metadata + profile dynamic OG + noindex private
- **Type**: `rule`
- **Given**: Website live
- **When**: Crawler visita
- **Then**: Home title/description corretti; canonical; /robots.txt e /sitemap.xml (statici o generati); /p/u pubblico metadata dinamico username OVR LV; dashboard/settings/pricing? si no index? /settings e /p privato → noindex nofollow tramite metadata o headers
- **Pass Condition**: Metadata presenti; robots accessibile; profile metadata dinamico corretto
- **Evidence**: Files app/sitemap.ts o public/sitemap.xml, robots.txt, generateMetadata in pages

### AC-32: Security: mutazioni accettano solo raw values + ownership everywhere
- **Type**: `rule`
- **Given**: Malicious client prova a POST { xpEarned:9999, careerIndexChange:+100, overall:99 } a /api/matches
- **When**: Server riceve
- **Then**: Questi campi ignorati (Zod schema non li parsano); valori ricalcolati; match diverso owner in PATCH → 401/403
- **Pass Condition**: API schemi Zod non accettano campi autoritativi; ownership check in ogni mutazione
- **Evidence**: Codice Zod schemas + owner checks in ogni POST/PATCH/DELETE API

### AC-33: PRO only personalizzazioni: 4 temi card + Next Goal + Records
- **Type**: `rule`
- **Given**: FREE e PRO utenti
- **When**: FREE vede temi card o records avanzati
- **Then**: FREE vede bloccato "Passa a PRO per sbloccare temi/record completi"; PRO vede 4 temi applicabili (stesso stats diverse); dashboard mostra MODULO "PROSSIMO OBIETTIVO" 1 solo
- **Pass Condition**: Theme switcher UI in profile settings PRO only; Next Goal modulo sempre visibile; Records in stats sezione con gating appropriato
- **Evidence**: UI temi + next goal + records

### AC-34: Achievements PRO aggiunti + re-check safe dopo match edit
- **Type**: `rule`
- **Given**: Seed aggiornato
- **When**: DB seedato
- **Then**: Achievement MATCHES_250, MATCHES_500, CAREER_INDEX_1800, GOALS_250, LEVEL_75 tier PRO presenti (non regalati); PATCH /api/matches ri-calcola achievements no duplicati
- **Pass Condition**: DB rows achievement PRO corretti; logica ri-check non produce doppioni
- **Evidence**: Seed rows + codice ri-check in route PATCH

### AC-35: 404 Branded e messaggi IT error/empty
- **Type**: `rule`
- **Given**: URL inesistente
- **When**: GET /pagina-inesistente
- **Then**: Pagina 404 con "Fuori dal campo." + "La pagina che stai cercando non esiste." + CTA "TORNA ALLA HOME" stile CalcettoXP; empty states altri flussi con messaggi italiani puliti.
- **Pass Condition**: 404 page risponde con status 404; UI coerente.
- **Evidence**: app/not-found.tsx o app/[...notfound]/page.tsx e empty messages nei componenti.

### AC-36: Accessibilità base (labels, semantica, reduced motion, contrasto)
- **Type**: `rubric`
- **Dimension**: Compliance WCAG base AA-ish
- **Scale**: 1-5
- **Anchors**: 1 = labels missing, contrasto basso; 3 = migliorabile ma non rompe; 5 = labels htmlFor per tutti input, heading gerarchici, prefers-reduced-motion disable animations, focus visible, contrasto sufficiente.
- **Pass Threshold**: >= 4
- **Evidence**: Code inspection globals.css reduce motion, html structure, aria labels.

### AC-37: Env variable audit (.env.example pulito + NEXT_PUBLIC_APP_URL + no secrets leaked)
- **Type**: `rule`
- **Given**: File .env.example
- **When**: Aperto
- **Then**: Contiene solo variabili richieste: DATABASE_URL, AUTH_SECRET (o NEXTAUTH_SECRET come richiesto da versione), GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO_MONTHLY, STRIPE_PRICE_PRO_YEARLY, NEXT_PUBLIC_APP_URL=https://calcettoxp.com. Niente valori reali.
- **Pass Condition**: Keys corretti; no doppioni AUTH_SECRET/NEXTAUTH_SECRET se la versione lo consente; NEXT_PUBLIC_APP_URL aggiunta.
- **Evidence**: File .env.example.

### AC-38: Runtime build verificato se Node disponibile
- **Type**: `rule`
- **Given**: Ambiente Node >= 18 attivo e configurato DB in .env
- **When**: npm install && npx prisma generate && npm run build && npm run lint
- **Then**: Exit codes 0 per tutti. Eventuali errori TS/hydration/import risolti
- **Pass Condition**: Comandi eseguiti con successo
- **Evidence**: Output comandi console (se Node installato) oppure dichiarazione BLOCKED con istruzione per utente.

## Open Questions
- [ ] Confermare periodo default della stagione (annuale agosto-giugno / solare / altro) - risolto 16 ago / 15 giu nel codice existing
- [x] Dettaglio configurazione PWA (next-pwa vs manifest + SW manuale) - uso @ducanh2912/next-pwa
- [ ] Icone PWA: placeholder PNG 192 e 512 pixel da generare (attualmente placeholder testo o SVG? se non possibile PNG via scrittura testo, aggiungere note in README)
- [ ] Multiplayer Card testi: tenere come da specifica o variare
- [ ] @vercel/og (Satori) per OG Image profile public dynamic? oppure fallback statico default
- [ ] Form eliminazione account: richiesta conferma testo scritto "ELIMINA DEFINITIVAMENTE" oppure doppia modale OK? (consiglio doppio step: button + confirm dialog con nome utente digitato)
