# CalcettoXP - Coerenza Legale / Commerciale Pass

## Overview
- **Summary**: Audit e correzione 100% di tutta la comunicazione commerciale (FREE/PRO, pricing, FAQ, upsell, landing) e dei documenti legali (Termini, Privacy, Cookie Policy, Disclaimer, LEGAL_CONFIG) affinché corrispondano ESATTAMENTE alle funzionalità realmente implementate nel codice.
- **Purpose**: Eliminare ogni promessa commerciale o dichiarazione legale non supportata dal codice attuale (trial non esistenti, provider fittizi, regole match obsolete, feature future vendute come presenti), mantenendo inalterato il funzionamento tecnico del prodotto.
- **Target Users**: CalcettoXP team; utenti che consultano pagine legali o di pricing.

## Goals
1. Tutti i claim PRO nel sito corrispondono a una funzionalità realmente implementata e accessibile via entitlement PRO.
2. Nessun riferimento a trial periodico / 14 giorni soddisfatti / rimborsi garantiti non realmente deliberati e configurati.
3. Termini aggiornati alle regole match reali (±72h, max 2/giorno, immutabilità PATCH 403, anti-duplicato ±2h).
4. Privacy aggiornata: rimozione Vercel Blob (non usato), aggiunta Referral + ShareRecord, foto profilo solo da Google OAuth.
5. Cookie Policy aggiornata: riferimento normativo corretto (Provv. 231/2021 del 10/06/2021), coerenza con CookieBanner esistente.
6. Disclaimer semplificato sulle future modalità multiplayer (senza dettagli implementativi vincolanti).
7. Clausola foro nei Termini resa conforme alle tutele consumer ("ferme disposizioni inderogabili").
8. `LEGAL_CONFIG.lastUpdated` portato alla data reale odierna.
9. `tsc --noEmit` e `next build` passano senza errori dopo le modifiche.
10. Report finale che enumera file, claim rimossi/mantenuti, dati mancanti del Titolare.

## Non-Goals
- Modificare il funzionamento del prodotto (backend, Prisma, Stripe, auth, entitlement, routing, formule XP/CI/OVR, Trophy, partite, componenti UI diversi da testi/copy).
- Aggiungere funzionalità, refactor, nuovi file se non assolutamente necessari per i copy.
- Push/deploy, migrazioni, scritture DB, configurazioni Stripe/Provider.
- Inventare dati societari/fiscali del Titolare (P.IVA, sede, CF, PEC, DPO, ragione sociale).

## Background & Context
Dall'audit read-only del 11/09/2026 sono emerse incoerenze:
- `/pricing` e landing dichiarano "periodo di prova", "14 giorni soddisfatti o rimborsati", "Insight sulla forma atletica", "Confronto stagioni", "Badge PRO su classifiche", "Tutte le novità in anteprima", "Supporto prioritario" → feature NON presenti o NON configurate.
- `/pricing` claim "Record e migliori streak PRO" → streak principali sono FREE; PRO ha solo analytics più profondi e storico completo.
- Stripe checkout in `/api/stripe/checkout/route.ts` NON configura `trial_period_days` → nessun trial tecnico.
- Termini ancora citano "max 3 partite/giorno" e "modifica 15 minuti" → oggi max 2/giorno e PATCH 403 immutabile.
- Privacy cita Vercel Blob e "file caricati dall'utente" → codice NON usa @vercel/blob; la foto arriva solo da Google OAuth.
- Cookie Policy cita "Provv. 10/2020, 30/06/2020" → riferimento errato; inoltre dice "non è attivo alcun sistema di preferenze" mentre CookieBanner (con toggle analitiche/marketing) ESISTE.
- Disclaimer sezione 3.2 dettaglia "conferme incrociate, arbitri, Trust Score, Ranked" come architettura futura già decisa → va semplificato.
- Termini sez. 8 "Foro esclusivo di Roma" → clausola assoluta non corretta per consumer.
- LEGAL_CONFIG.lastUpdated = 2026-09-09 (da aggiornare).

Features PRO VERIFICATE nel codice (confermate 11/09/2026):
1. Analytics 7 / 30 / 90 giorni (gating PRO nel dashboard/stats).
2. Statistiche per ruolo.
3. Storico completo Career Index (FREE: ultimi 20; PRO: completo).
4. Storico partite oltre la stagione corrente / storico completo stagioni (PRO gating in profile).
5. Record / grafici avanzati periodo PRO.
6. 30 trofei PRO (catalogo `achievement-catalog.ts`; progressione tracciata anche FREE).
7. Temi Card NIGHT / ELITE / NEON (oltre a CLASSIC FREE, in PlayerCard, DashboardCardStage).
8. Badge PRO su Card e profilo.
9. Cambio username con cooldown 30gg; solo PRO può cambiare username se non passato il periodo (gating).
10. Tutto incluso in FREE.
11. Storico partite completo.

Dati mancanti del Titolare (da NON inventare, da segnalare a report):
- Ragione sociale / nome e cognome titolare
- Indirizzo / sede completa
- P.IVA o CF
- PEC
- DPO (se nominato)

## Functional Requirements
- **FR-1 CLAIM PRO /pricing**: Lista PRO in `pricing/page.tsx` (`pricingPro`) sostituita con la lista VERIFICATA (11 punti); rimossi tutti i claim non supportati.
- **FR-2 CLAIM PRO landing**: Array `pricingPro` in `page.tsx` (landing) allineato alla lista verificata (breve ma vera).
- **FR-3 TRIAL/RIMBORSO /pricing**: Rimosso "14 giorni soddisfatti o rimborsati" (r.255); FAQ (r.285-287) "C'è un periodo di prova?" sostituita con formulazione prudente: nessun trial configurato, riferimenti ai diritti consumer vigenti. Riga FREE FOREVER "Nessuna carta richiesta" resta corretta.
- **FR-4 UPSELL PRO dashboard/profile**: Copy esistenti ("statistiche avanzate", "temi premium", "record avanzati", "storico completo") mantengono il riferimento ma devono essere coerenti con la lista verificata (nessun nuovo CTA, nessun design change; solo ritocchi di singole parole se ambigue).
- **FR-5 TERMINI regole match**: Sez. 3 "Solo Career" aggiornata: ±72h finestra, non future, max 2 partite/giorno, anti-duplicazione ±2h, immutabilità "definitive/non modificabili" (PATCH 403). Rimuovi "15 minuti" e "3 partite/giorno". Non chiamare regole come "certificazione".
- **FR-6 TERMINI PRO sez.4**: Lista PRO generica (sez 4.1) + Rimborso (4.4) riformulato in modo prudente (rimborso secondo diritto consumer vigente, non politica inventata). Non citare "Stripe decide".
- **FR-7 TERMINI foro sez.8**: Clausola foro resa consumer-friendly ("ferme disposizioni inderogabili"). No arbitrato.
- **FR-8 TERMINI natura servizio / no pay-to-win**: Sez. 1 e 4.3 rafforzate come da punto 7 e 17 dell'input.
- **FR-9 PRIVACY Vercel Blob rimossa**: Sez 2.4 rimuovi riferimento a `services.storage`; chiarire che la foto profilo viene da Google OAuth (non upload utente).
- **FR-10 PRIVACY Referral + ShareRecord**: Aggiunta sezione 2.x che descrive referralCode, relazione invitante/invitato, onboarding completato, ShareRecord (anti-farming, 1/giorno), nessun contenuto messaggio privato salvato.
- **FR-11 PRIVACY base giuridica OAuth**: Sostituire "consenso esplicito (art. 6.1.a) ove richiesto" in favore di "contratto e misure precontrattuali (art. 6.1.b)" per login/auth/servizio; consenso riservato solo a trattamenti opzionali se esistenti.
- **FR-12 PRIVACY Export / Elimina**: Sez. 7.1 e 7.2 confermano gli strumenti realmente esistenti (GET /api/data/export, DELETE /api/account).
- **FR-13 DISCLAIMER multiplayer futuro sez. 3.2**: Sostituire dettagli tecnici (conferme incrociate, arbitri, Trust Score, Ranked) con formulazione generica del punto 8 dell'input.
- **FR-14 DISCLAIMER + TERMINI natura ricreativa**: Confermare lista esclusioni (non federale, non certificato, non scouting, non medico, non scommesse, non ranking competitivo oggi).
- **FR-15 COOKIE POLICY riferimento normativo sez.5**: Aggiornare a "Linee guida cookie e altri strumenti di tracciamento del Garante per la Protezione dei Dati Personali, Provvedimento n. 231 del 10 giugno 2021".
- **FR-16 COOKIE POLICY sez.2 coerenza banner**: Rimuovere frase "non è attivo alcun sistema di preferenze" perché CookieBanner con pannello ESISTE; sostituire con frase del punto 11 dell'input.
- **FR-17 LEGAL_CONFIG lastUpdated**: `lastUpdated` = "2026-09-11", `lastUpdatedHuman` = "11 settembre 2026". `services.storage` (Vercel Blob) RIMOSSO da oggetto.
- **FR-18 IVA fiscale**: Non inventare trattamento IVA specifico. Rimuovere o riformulare frasi "IVA inclusa ove applicabile" in modo neutro ("Secondo la normativa fiscale vigente, ove applicabile") se non confermabili.
- **FR-19 RICERCA GLOBALE stringhe proibite**: Dopo modifiche, cercare e verificare che non rimangano occorrenze indebite di: "periodo di prova", "prova gratuita", "14 giorni soddisfatti", "rimborsati", "3 partite", "15 minuti", "Vercel Blob", "cookie 10/2020", "Foro di Roma" (in forma esclusiva), "IVA inclusa" (se inutile).

## Non-Functional Requirements
- **NFR-1 NO FUNZIONALITÀ NUOVE**: Tutte le modifiche sono solo copy/testo/className minori per l'impaginazione.
- **NFR-2 NESSUN DATO INVENTATO**: Se un'informativa richiede dati del Titolare che LEGAL_CONFIG non ha, lasciare il generico (calcettoxp@gmail.com, Italia, dominio) e segnalare MISSING nel report.
- **NFR-3 LINGUA ITALIANA CORRETTA**: Pagine legali professionali e sobrie; formulazioni prudenti; nessun marketing aggressivo dentro le policy.
- **NFR-4 COERENZA INTERNA**: Stessi termini usati ovunque (Trofei, Player Card/Card, Career Index/CI, OVR, XP, PRO, Solo Career, auto-dichiarate).
- **NFR-5 STILE PREMIUM MANTENUTO**: Copy commerciali brevi, eleganti, non "venduti"; nessun claim extra.
- **NFR-6 BUILD**: `tsc --noEmit` exit 0, `next build` exit 0.

## Constraints
- **Technical**: NO modifiche Prisma/schema/migrations, NO endpoint API nuovi, NO Stripe config, NO auth change, NO entitlement change, NO modifiche Trophy System o formule, NO routing, NO responsive, NO logica componenti.
- **Business**: NO nuove funzionalità, NO nuove CTA, NO nuovi provider, NO nuovi tracciamenti cookie.
- **Dependencies**: Dipendenze npm esistenti, nessuna nuova installazione.

## Assumptions
- I copy PRO mantenuti sono quelli che corrispondono a un gating esistente nei componenti (stats 7/30/90g, storico CI, temi NIGHT/ELITE/NEON, badge PRO, cambio username PRO, trofei PRO).
- Il limite giornaliero partite è 2 (da route.ts r. 130) NON 3.
- La finestra temporale per registrare è ±72h (route.ts r. 85-95).
- Le partite sono immutabili: PATCH → 403 (route.ts r. 83-87).
- Foto profilo: esclusivamente da Google OAuth, nessun file upload utente via Vercel Blob.
- Referral esiste in lib/referral.ts e ShareRecord esiste in share/track route (precedenti sessioni).

## Acceptance Criteria

### AC-1: Sito non promette più trial / 14 giorni rimborsati
- **Type**: `rule`
- **Given**: build di produzione effettuata
- **When**: si analizza il codice sorgente di `/pricing`, FAQ, landing copy, termini
- **Then**: nessuna frase che indica "periodo di prova PRO" configurato, nessun "14 giorni soddisfatti o rimborsati", nessun "rimborso garantito"
- **Pass Condition**: Grep per `"periodo di prova"|"prova gratuita"|"14 giorni"|"soddisfatti o rimborsati"|"rimborsati"` nel folder src (eccetto stringhe di esempio se non ci sono) restituisce 0 occorrenze in copy commerciali/legali
- **Evidence**: Grep output post-modifiche + report

### AC-2: Lista PRO /pricing e landing corrisponde al prodotto VERO
- **Type**: `rule`
- **Given**: pricingPro in pricing/page.tsx e in page.tsx
- **When**: confronto con la lista PRO verificata (BG)
- **Then**: ogni elemento della lista PRO corrisponde a una funzionalità implementata; rimossi: "Insight sulla forma atletica", "Confronto stagioni" (come modulo dedicato), "Badge PRO su classifiche", "Tutte le novità in anteprima", "Supporto prioritario", "Migliori streak PRO" (non stretta esclusività)
- **Pass Condition**: diff delle due array mostra solo la lista VERIFICATA
- **Evidence**: file diff + grep

### AC-3: Termini regole match aggiornate
- **Type**: `rule`
- **Given**: termini page.tsx sez. 3 e sez. 4
- **When**: confronto con i vincoli reali in api/matches (±72h, non futuro, max 2/g, ±2h dedup, PATCH 403)
- **Then**: nessun riferimento a "15 minuti modifica", nessun "3 partite giornaliere"; menzionata la finestra 72h, il limite 2/g, l'immutabilità e controlli anti-abuso
- **Pass Condition**: grep `"15 minuti"` → 0; `"3 partite"` → 0; `"72 ore"` oppure `"finestra temporale"` → almeno 1 occorrenza; `"2 partite"` oppure `"due partite"` → 1 occorrenza
- **Evidence**: grep output

### AC-4: Privacy non cita Vercel Blob e descrive Referral/Share
- **Type**: `rule`
- **Given**: privacy page.tsx
- **When**: lettura sez 2.x e legal-config
- **Then**: sezione Vercel Blob rimossa; esiste una sezione 2.x che descrive Referral (referralCode, relazione invitante/invitato, onboarding), ShareRecord (1 condivisione valida/giorno, sorgente tecnica), nessun contenuto messaggio privato salvato; foto profilo descritta come "da Google OAuth eventualmente fornita"
- **Pass Condition**: grep `"Vercel Blob"` in src → 0; referral e Share presenti al testo Privacy
- **Evidence**: grep output + file privacy modificato

### AC-5: Cookie Policy riferimento corretto + coerenza banner
- **Type**: `rule`
- **Given**: cookie-policy/page.tsx
- **When**: sez. 5 e sez. 2
- **Then**: riferimento normativo = "Provvedimento n. 231 del 10 giugno 2021"; sez. 2 NON contiene frase "non è attivo alcun sistema di preferenze"; frase sostitutiva conforme al punto 11 dell'input
- **Pass Condition**: grep "10/2020" → 0; grep "231 del 10 giugno 2021" → 1; frase sistema preferenze aggiornata
- **Evidence**: grep output

### AC-6: Disclaimer sez. multiplayer futuro semplificata
- **Type**: `rule`
- **Given**: disclaimer/page.tsx sez. 3.2
- **When**: confronto
- **Then**: rimossi dettagli (conferme incrociate, arbitri, Trust Score, Ranked); sostituita con la frase standard "Eventuali future modalità multiplayer o di verifica, se introdotte, saranno disciplinate separatamente..."
- **Pass Condition**: grep "Trust Score" o "conferme incrociate" nel disclaimer → 0; frase nuova presente
- **Evidence**: diff disclaimer

### AC-7: Clausola foro consumer friendly
- **Type**: `rule`
- **Given**: termini/page.tsx sez. 8
- **When**: lettura
- **Then**: NON clausola "foro esclusivo di Roma" in forma assoluta; presente formulazione: "Per i consumatori restano ferme le disposizioni inderogabili previste dalla normativa applicabile... Negli altri casi si applicano le regole di competenza..."
- **Pass Condition**: grep esatto `"esclusiva il Foro di Roma"` → 0; frase conforme 1 occorrenza
- **Evidence**: grep termini output

### AC-8: LEGAL_CONFIG aggiornato
- **Type**: `rule`
- **Given**: src/lib/legal-config.ts
- **When**: lettura
- **Then**: `lastUpdated = "2026-09-11"`; `lastUpdatedHuman = "11 settembre 2026"`; oggetto `services.storage` (Vercel Blob) RIMOSSO
- **Pass Condition**: date valide e services.storage undefined
- **Evidence**: file legal-config modificato

### AC-9: tsc --noEmit e next build superati
- **Type**: `rule`
- **Given**: ambiente npm, .env presente
- **When**: eseguiti i comandi
- **Then**: exit code 0 per entrambi
- **Pass Condition**: log di terminazione 0
- **Evidence**: log stdout comandi

### AC-10: Qualità copy (leggibilità e prudenza)
- **Type**: `rubric`
- **Dimension**: Coerenza, leggibilità, non esagerazione commerciale nelle policy
- **Scale**: 1-5
- **Anchors**: 1 = molti claim iperbolici o linguaggio illegibile; 3 = migliorabile ma corretto; 5 = linguaggio sobrio, preciso, ogni frase verificabile, nessun marketing inside policy
- **Pass Threshold**: >= 4
- **Evidence**: revisione read-only dei 4 file legali modificati

## Open Questions
- [x] IVA: confermato da codice che non sappiamo se i prezzi sono IVA inclusa o no? → Sì, non lo sappiamo, quindi riformulare in neutro "secondo la normativa vigente ove applicabile" o rimuovere.
- [x] Dati Titolare (Ragione sociale, Sede, P.IVA, CF, PEC, DPO): mancano in LEGAL_CONFIG → NON inventare, riportare a report come MISSING LEGAL OWNER DATA.
