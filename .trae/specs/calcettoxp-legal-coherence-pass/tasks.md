# CalcettoXP - Coerenza Legale / Commerciale Pass - Implementation Plan

## Task 1: Aggiorna LEGAL_CONFIG (date + rimuovi Vercel Blob)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Modifica `src/lib/legal-config.ts`:
    - Aggiorna `lastUpdated` a `"2026-09-11"`
    - Aggiorna `lastUpdatedHuman` a `"11 settembre 2026"`
    - Rimuovi la proprietà `services.storage` (Vercel Blob) perché non utilizzato nel codice.
  - Non toccare altre proprietà.
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `rule` TR-1.1: `grep -n "Vercel Blob" src/lib/legal-config.ts` restituisce 0 righe.
  - `rule` TR-1.2: `grep -n "lastUpdated" src/lib/legal-config.ts` mostra `lastUpdated = "2026-09-11"`.
  - `rule` TR-1.3: `grep -n "11 settembre 2026" src/lib/legal-config.ts` restituisce 1 occorrenza.
- **Notes**: Vercel Blob non viene rimosso dai servizi perché è già dichiarato in services.storage ma non usato; privacy e cookie policy lo citano indirettamente e saranno aggiornati nei task 5.

## Task 2: Riscrivi lista PRO e rimuovi trial/rimborsi da /pricing
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Modifica `src/app/pricing/page.tsx`:
    - Sostituisci array `pricingPro` (r.41-54) con la lista VERIFICATA:
      1. "Tutto incluso nel piano FREE"
      2. "Analytics 7 / 30 / 90 giorni"
      3. "Statistiche dettagliate per ruolo"
      4. "Storico completo Career Index"
      5. "Storico partite completo"
      6. "Storico completo delle stagioni"
      7. "Record stagionali avanzati"
      8. "Card premium Night, Elite e Neon"
      9. "30 trofei PRO"
      10. "Badge PRO su Card e profilo"
      11. "Cambio username periodico"
      12. "Progressi trofei PRO tracciati anche durante FREE"
    - Rimuovi frase "14 giorni soddisfatti o rimborsati" in r. 254 (sotto card Annuale). Sostituisci con frase vuota o rimuovi riga `<p>` se non necessaria.
    - Sostituisci FAQ "C'è un periodo di prova?" (r. 285-287) con la risposta prudente: "Il piano PRO si attiva immediatamente al momento dell'abbonamento; non è attualmente previsto un periodo di prova tecnico. I diritti di recesso, rimborso e gli altri diritti del consumatore si applicano nei casi e secondo le modalità previste dalla normativa vigente."
    - Rimuovi da termini in pricing le frasi "IVA inclusa ove applicabile" (se esistono) → già dentro termini page, non nel pricing; pricing non deve menzionare IVA.
    - Verifica che nella FAQ "Posso cancellare l'abbonamento in qualsiasi momento?" la risposta resti corretta ma non prometta rimborsi retroattivi.
  - Nessun cambiamento al design/carte colori/icone.
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `rule` TR-2.1: `grep -n "14 giorni soddisfatti o rimborsati" src/app/pricing/page.tsx` → 0 occorrenze.
  - `rule` TR-2.2: `grep -n "periodo di prova\|prova gratuita" src/app/pricing/page.tsx` nella FAQ → 1 occorrenza con risposta negativa prudente, nessuna promessa.
  - `rule` TR-2.3: `pricingPro.length === 12` e tutti gli elementi inclusi.
  - `rule` TR-2.4: `grep -n "Insight sulla forma atletica\|Confronto stagioni\|Badge PRO su classifiche\|Tutte le novità in anteprima\|Supporto prioritario\|migliori streak" src/app/pricing/page.tsx` → 0 (case-insensitive).
- **Notes**: Non toccare StripeButtons, colori, badge "Più popolare" o prezzi.

## Task 3: Allinea lista PRO landing page.tsx (copy commerciali)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Modifica `src/app/page.tsx`:
    - Array `pricingPro` (r.69-74): sostituiscilo con una versione corta ma vera (non serve lunghissima, max 9-10 punti, tutti verificati).
    - Rimuovi elementi non verificati come "Supporto prioritario" e "Storico completo illimitato" (preferisci "Storico completo Career Index").
  - Non toccare hero, demo players, grafici, steps, footer.
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-3.1: `grep -n "Supporto prioritario\|Grafici evoluti" src/app/page.tsx` (se non corrispondono a feature vere) → 0 o riformulato.
  - `rule` TR-3.2: tutti gli elementi nella nuova lista PRO sono inclusi nella lista 12 punti verificata.
- **Notes**: "Partite illimitate" è corretto (non c'è limite lifetime). Tieni la lista compatta come è oggi.

## Task 4: Allinea copy upsell PRO dashboard/profile (minimi ritocchi)
- **Status**: `pending`
- **Priority**: low
- **Depends On**: None
- **Description**:
  - Leggi `src/app/dashboard/page.tsx` card PRO (sezione FREE) e `src/app/profile/page.tsx` sezione FREE PRO.
  - Verifica che i copy esistenti ("statistiche avanzate", "temi premium", "record avanzati", "storico completo") non aggiungano claim extra. Se una frase non corrisponde, correggi la singola parola.
  - **NON cambiare design, layout, colori o CTA**. Solo micro-ritocchi di testo se ambiguo.
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `rule` TR-4.1: Nessuna frase contiene "classifiche", "anteprima", "confronto stagioni" nel contesto upsell PRO.
- **Notes**: Preferibile "nessuna modifica" se i testi già sono "statistiche avanzate / temi premium / record avanzati" (generici ma coerenti con la lista PRO vera).

## Task 5: Aggiorna Privacy Policy (Vercel Blob + Referral + base giuridica + Foto)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Modifica `src/app/privacy/page.tsx`:
    - Sez. 2.4 "Database e infrastruttura": rimuovi il bullet `{services.storage.name}` (Vercel Blob). Lascia Neon + Vercel Hosting. Aggiorna il titolo della sezione togliendo ", Vercel Blob".
    - Sostituisci il riferimento a "file caricati dall'Utente" o "storage di immagini del profilo" con: "L'eventuale foto del profilo associata all'account proviene esclusivamente dall'immagine pubblica fornita da Google durante l'autenticazione. CalcettoXP non offre attualmente una funzionalità di upload diretto di file o immagini da parte dell'utente."
    - Aggiungi una **nuova Sezione 2.5** dal titolo *"2.5 Referral e condivisioni social (referralCode, ShareRecord)"*: descrive referralCode, relazione invitante/invitato, tracciamento completamento onboarding, ShareRecord (1 condivisione valida/giorno anti-farming, sorgente tecnica), **nessun contenuto di messaggio privato salvato**, cookie `cxp_ref` 60 giorni. Spiega che l'utente decide autonomamente il canale e il destinatario del messaggio condiviso.
    - Rinomina la vecchia 2.5 (Cookie) → 2.6 e la 2.6 (Log) → 2.7.
    - Sez. 2.1 OAuth Google: nella base giuridica sostituisci "consenso esplicito dell'utente (art. 6.1.a GDPR) ove richiesto" con qualcosa del tipo: *"Base giuridica: esecuzione del contratto e misure precontrattuali (art. 6.1.b GDPR) per la creazione dell'account e la fornitura del Servizio. Il consenso, quando richiesto per specifici trattamenti opzionali, viene raccolto separatamente secondo le modalità previste dalla normativa."*
    - Sez. 1 Titolare: NON inventare dati. Mantieni il testo minimale attuale (CalcettoXP, Italia, email, sito). Nessun placeholder P.IVA/sede.
    - Mantieni sez. 7.1 (Scarica i miei dati) e 7.2 (Elimina account): entrambi esistono davvero.
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `rule` TR-5.1: `grep -n "Vercel Blob\|file caricati" src/app/privacy/page.tsx` → 0.
  - `rule` TR-5.2: `grep -n "referralCode\|ShareRecord\|condivisioni social\|cxp_ref" src/app/privacy/page.tsx` → almeno 3 occorrenze.
  - `rule` TR-5.3: `grep -n "6.1.a GDPR\|consenso esplicito dell.*utente" src/app/privacy/page.tsx` in sezione OAuth → rimosso.
  - `rule` TR-5.4: Frase sulla foto profilo da Google OAuth presente.
- **Notes**: Non modificare i link alle policy dei provider (Google, Neon, Vercel, Stripe), mantenere il formato esistente di LegalLayout.

## Task 6: Aggiorna Termini e Condizioni (regole match + PRO + foro + natura servizio)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Modifica `src/app/termini/page.tsx`:
    - **Sez. 3 Modalità Solo Career**:
      - Rimuovi frase: *"Il blocco di modifica dopo 15 minuti dalla registrazione e il limite di 3 partite giornaliere..."*
      - Sostituisci con: *"Le registrazioni delle partite devono rispettare la finestra temporale prevista dal sistema (attualmente ±72 ore rispetto alla data attuale) e non possono essere inserite nel futuro. Una volta registrate, le partite sono considerate definitive e non modificabili secondo la logica attuale del Servizio. Sono applicati automaticamente limiti anti-abuso (attualmente massimo 2 partite registrabili per giorno solare) e controlli anti-duplicazione basati sulla finestra temporale della partita. Tali misure sono strumenti di salvaguardia dell'esperienza ricreativa e non costituiscono certificazione di veridicità dei dati."*
      - Aggiorna elenco negazioni con: *"non sono statistiche federali, non sono certificazioni sportive, non sono scouting professionale, non sono valutazioni mediche o atletiche, non garantiscono abilità o opportunità professionali"*.
    - **Sez. 4.1 Piani**: Rimuovi "confronti stagionali, insight di forma avanzati". Aggiorna la lista PRO generica per corrispondere a funzionali vere. Rimuovi/neutralizza "IVA inclusa ove applicabile" sostituendo con *"I prezzi visualizzati includono l'IVA, ove applicabile secondo la normativa fiscale vigente, e possono essere aggiornati previa comunicazione."* (frase prudente).
    - **Sez. 4.4 Rimborso**: Riscrivi in modo prudente: *"I diritti di recesso, rimborso e gli altri diritti del consumatore si applicano nei casi e secondo le modalità previste dalla normativa vigente. Per richieste o comunicazioni relative al proprio abbonamento è possibile scrivere a [email] oppure utilizzare il Customer Portal Stripe accessibile da Impostazioni → Abbonamento → Gestisci abbonamento. La cancellazione del rinnovo automatico non costituisce di per sé rimborso per i periodi già goduti, fatti salvi i diritti inderogabili riconosciuti al consumatore."*
    - **Sez. 4.2 Pagamenti**: Aggiungi *"Il rinnovo è automatico alla fine del periodo pagato e può essere disattivato in qualsiasi momento tramite il Customer Portal Stripe, senza penali."*
    - **Sez. 4.3 No pay-to-win**: Mantieni e rafforza leggermente come da punto 17 dell'input (PRO NON modifica XP, CI, OVR, formule sportive, risultati, ranking).
    - **Sez. 8 Legge applicabile e foro**: Sostituisci la frase assoluta con la formulazione consumer friendly: *"I presenti Termini sono regolati dalla legge italiana. Per i consumatori restano ferme le disposizioni inderogabili previste dalla normativa applicabile, incluso il foro competente del consumatore ove previsto. Negli altri casi si applicano le regole di competenza previste dalla legge."*
    - **Sez. 1 Oggetto del servizio**: Aggiorna lista dei "NON è" includendo: piattaforma di scommesse/gioco d'azzardo, servizio medico, federazione sportiva, agenzia di scouting.
- **Acceptance Criteria Addressed**: AC-3, AC-6 (parziale), AC-7
- **Test Requirements**:
  - `rule` TR-6.1: `grep -n "15 minuti\|3 partite" src/app/termini/page.tsx` → 0.
  - `rule` TR-6.2: `grep -n "72 ore\|2 partite\|non modificabili\|finestra temporale" src/app/termini/page.tsx` → tutte presenti.
  - `rule` TR-6.3: `grep -n "esclusiva il Foro di Roma" src/app/termini/page.tsx` → 0; frase consumer friendly presente.
  - `rule` TR-6.4: `grep -n "Scout\|medico\|scommesse\|federazione" src/app/termini/page.tsx` → presenti nella lista di esclusione.
- **Notes**: Non toccare struttura numero sezioni se non per chiarezza.

## Task 7: Aggiorna Disclaimer (multiplayer futuro semplificato)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Modifica `src/app/disclaimer/page.tsx`:
    - **Sez. 3.2 Multiplayer / Ranked / Verificato (FUTURO)**: rimuovi l'intera lista puntata (conferme incrociate, arbitri designati, Trust Score, Ranked separato).
    - Sostituisci la sezione 3.2 con: *"Eventuali future modalità multiplayer o di verifica, se introdotte, saranno disciplinate separatamente e chiaramente distinte dai dati auto-dichiarati della Solo Career. Fino a quel momento tutte le metriche mostrate dal Servizio si riferiscono esclusivamente alla Solo Career auto-dichiarata a scopo ricreativo."*
    - Mantieni la sezione 3.1 Solo Career e il resto della struttura.
    - Rafforza (se assenti) i punti del punto 7 dell'input: metriche interne, NON federali, NON certificazioni, NON scouting, NON mediche/atletiche, NON garanzie abilità.
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-7.1: `grep -n "Trust Score\|conferme incrociate\|Ranked\|arbitri designati" src/app/disclaimer/page.tsx` → 0.
  - `rule` TR-7.2: frase "Eventuali future modalità multiplayer o di verifica, se introdotte..." presente.
- **Notes**: Non modificare la citazione del nome delle sezioni "Solo Career" o "Multiplayer futuro" purché il testo sia cambiato.

## Task 8: Aggiorna Cookie Policy (riferimento normativo + coerenza banner)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Modifica `src/app/cookie-policy/page.tsx`:
    - **Sez. 2 Nessun blocco preventivo...**: sostituisci il paragrafo nel blockquote *"non è attivo alcun sistema di preferenze"* con la frase conforme al punto 11 dell'input: *"CalcettoXP non carica attualmente strumenti analitici o di marketing. Il pannello di gestione delle preferenze (CookieBanner) permette di consultare e gestire le categorie cookie e sarà utilizzato qualora in futuro vengano introdotti strumenti opzionali, nel rispetto della normativa applicabile."*
    - **Sez. 5 Riferimenti normativi**: sostituisci "Provv. 10/2020, 30/06/2020" con *"Linee guida cookie e altri strumenti di tracciamento del Garante per la Protezione dei Dati Personali, Provvedimento n. 231 del 10 giugno 2021."*
  - Non toccare il resto (liste cookie necessari, CookiePrefCard).
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `rule` TR-8.1: `grep -n "10/2020\|30/06/2020" src/app/cookie-policy/page.tsx` → 0.
  - `rule` TR-8.2: `grep -n "Provvedimento n. 231 del 10 giugno 2021" src/app/cookie-policy/page.tsx` → 1.
  - `rule` TR-8.3: `grep -n "non è attivo alcun sistema di preferenze" src/app/cookie-policy/page.tsx` → 0; frase nuova presente.
- **Notes**: CookieBanner è già coerente con questa descrizione.

## Task 9: Ricerca globale stringhe proibite (pulizia finale)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 2, 3, 6, 7, 8
- **Description**:
  - Esegui una ricerca globale in `src/` delle stringhe/concetti:
    - "periodo di prova", "prova gratuita" → deve trovarsi solo nella risposta FAQ che dice "non attivo", se è presente altrove rimuovi/riscrivi.
    - "14 giorni", "soddisfatti o rimborsati", "rimborsati" → 0 in contesti commerciali.
    - "3 partite", "15 minuti" → 0.
    - "Vercel Blob" → 0.
    - "cookie 10/2020", "Provv. 10/2020" → 0.
    - "foro esclusivo di Roma", "Foro esclusivo di Roma" → 0.
    - "IVA inclusa" → solo in formulazioni prudenti "secondo normativa vigente".
    - "classifiche" come badge PRO → 0 (eccetto dove in contesti giusti: "posizioni in classifiche future" nel pay-to-win, è corretto).
  - NON eliminare alla cieca; valuta ogni contesto. Conserva se la frase è corretta (es. "non influenza classifiche future" è OK).
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-5, AC-7
- **Test Requirements**:
  - `rule` TR-9.1: Report che documenta ogni stringa trovata + decisione (mantenuta/rimossa) e relativa riga.
- **Notes**: Registra nel report del task ogni rimozione così da poterla riportare nel report finale.

## Task 10: Build e test di regressione (tsc + next build)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 - 9 completati
- **Description**:
  - Esegui `npx tsc --noEmit` dalla root del progetto.
  - Esegui `npx next build` dalla root del progetto.
  - Nessuna migration, nessun DB write, nessun deploy.
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-10.1: tsc exit code 0.
  - `rule` TR-10.2: next build exit code 0.
- **Notes**: Registra entrambi gli stdout nel report.

## Task 11: Report finale sintetico (25 punti)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 10
- **Description**:
  - Crea un report in chat finale (nessun file) che copre i 25 punti dell'input utente (file modificati, claim rimossi, claim mantenuti, trial corretto, termini match, privacy, referral, provider rimossi, cookie corretta, disclaimer, foro, dati legali mancanti, tsc, build).
  - Includi **MISSING LEGAL OWNER DATA** con l'elenco esatto delle informazioni mancanti (Ragione sociale / Nome e Cognome titolare; Indirizzo sede; P.IVA / CF; PEC; DPO se nominato).
  - NON fare push/deploy e specificalo esplicitamente.
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10
- **Test Requirements**:
  - `rubric` TR-11.1: Completezza report; scale 1-5; anchors: 1 = dettagli insufficienti; 3 = chiavi ma lacunoso; 5 = tutti 25 punti coperti, MISSING chiari, esiti superati/falliti documentati.
  - Soglia: >= 4
