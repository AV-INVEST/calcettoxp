# Spec: CALCETTOXP — Mobile UI Polish / Allineamento / Safe Zone

## Problema
Diverse sezioni della UI mobile risultano compresse, decentrate, disallineate o poco ordinate, compromettendo la leggibilità e la sensazione premium del prodotto. Il task richiede un riallineamento mirato *solo su mobile*, senza toccare il desktop o la logica applicativa.

## Utenti e contesto d'uso
- Giocatori CalcettoXP autenticati che visualizzano la dashboard, il profilo e le statistiche da smartphone (390px, 412–430px, viewport Android realistiche).
- L'app è mobile-first; l'esperienza deve essere ariosa, centrata, leggibile e premium.

## Goals
1. Ripulire e riallineare il Profile Hero mobile: LV/OVR/CI più ordinato, pulsante edit solo icona.
2. Migliorare la Edit Profile Modal mobile: CTA salvataggio in alto + safe-area corretta.
3. Premiumizzare la sezione "Condividi la mia card" in dashboard.
4. Riallineare il box Key Metrics (OVR/CI/LV) sotto la share.
5. Uniformare centratura e spaziature interni ai box: Streak/Settimana/Stagione/Miglior CI, Partite/Vittorie/Gol/Assist.
6. Ripulire i box "Vantaggi esclusivi" (PRO upsell).
7. Verificare che il desktop non venga peggiorato.

## Non-Goals
- Modificare logiche backend, routing, formule CI/XP/OVR, progressive o gameplay.
- Cambiare il layout desktop o introdurre nuovi pattern desktop.
- Aggiungere feature fuori dalle 7 aree sopra.
- Ridefinire la palette colori o i token di design.
- Eseguire push/deploy o modhe di build permanenti.

## Requisiti Funzionali (solo mobile: < md breakpoint)

### FR1 — Profile Hero mobile
- File: `src/app/profile/page.tsx`
- Il blocco con LV/OVR/CI (righe 311-335 circa) deve risultare più arioso, centrato e ben allineato verticalmente.
- Rimozione del testo "Modifica profilo" sul pulsante CTA: lasciare solo l'icona matita (pencil).
- Pulsante edit: restare chiaro, cliccabile e visivamente integrato (stile attuale ma senza label).
- Lo spazio recuperato deve essere usato per migliorare allineamento e spaziatura di LV/OVR/CI.
- Se utile, su mobile la hero card può usare più righe interne invece di comprimere tutto in una sola fascia.
- Testi/numeri/pill: centrati, allineati verticalmente, spazi coerenti, nessun effetto "ammassato".

### FR2 — Edit Profile Modal mobile
- File: `src/components/profile/EditProfileModal.tsx`
- Accanto alla X in alto a destra (chiudi) aggiungere una CTA salvataggio con icona floppy/disk.
- Deve risultare chiaro: X = chiudi; disk = salva.
- CTA save: mobile-friendly, ben visibile ma non invasiva.
- Aggiungere safe-area spacing corretto:
  - `padding-bottom` sufficiente
  - rispetto della bottom nav fissa (≈80-88px)
  - uso di `env(safe-area-inset-bottom)` dove utile
  - contenuto e azioni sempre raggiungibili senza essere coperti
- Non cambiare la logica di salvataggio; solo UI/UX.

### FR3 — Sezione "Condividi la mia card" (dashboard)
- File: `src/app/dashboard/page.tsx` (sezione righe 344-400 circa) + `src/components/share/ShareCardButton.tsx`
- Layout più premium e centrato su mobile.
- Gerarchia visiva bilanciata tra titolo, sottotitolo, bottone condividi, azione copia link.
- Evitare wrap "brutti" o elementi sparsi.
- Il blocco deve sembrare una feature importante, non un afterthought.

### FR4 — Box Key Metrics (OVR/CI/LV)
- File: `src/app/dashboard/page.tsx` (righe 402-459 circa)
- Tre colonne realmente pulite, coerenti e bilanciate.
- Riallineare label, valori numerici, divisori verticali.
- Tre blocchi otticamente centrati; evitare numeri "appoggiati in alto" o distribuiti male.

### FR5 — Box Record e Stats mobile
- File: `src/app/dashboard/page.tsx`
  - Streak/Settimana/Stagione/Miglior CI (righe 592-693)
  - Partite/Vittorie/Gol/Assist + Win Rate (righe 914-976)
- Dove necessario, anche in `src/app/stats/page.tsx` per box simili (StatCard, RecordBox).
- Ribilanciare padding interno, altezza minima, allineamento verticale.
- Centrare meglio icone, titoli, valori, sottotesti.
- Uniformare spaziature.
- Ogni card deve sembrare progettata per mobile, non adattata male dal desktop.

### FR6 — Vantaggi esclusivi (PRO upsell)
- File: `src/app/dashboard/page.tsx` (righe 1023-1132 circa)
- Riallineare i box: icona, titolo, descrizione, lock icon.
- Mantenere identità premium gold.
- Testi più compatti ma leggibili.
- Evitare effetto "sbilanciato" o "troppo in alto".

### FR7 — Scoping & Non-regression
- Tutte le modifiche sopra devono valere ESCLUSIVAMENTE in mobile (breakpoint `md` e inferiori, ossia < 768px), usando classi `md:` ove necessario per preservare/ripristinare il desktop.
- Verifica che il desktop non peggiori visivamente.

## Requisiti Non Funzionali
- **Mobile-first**: tutte le modifiche devono essere testate pensando a viewport 390px, 412-430px e Android realistiche.
- **Performance**: nessuna modifica che introduca reflow/repaint eccessivo; solo Tailwind utilities statiche.
- **Accessibilità**: contrasti preservati; icone pulsanti hanno `aria-label` dove la label è rimossa.
- **Sicurezza**: nessun cambiamento a logiche, fetch o auth.
- **Build/Typecheck**: deve passare `tsc --noEmit` e `next build` senza errori nuovi.

## Dipendenze e Assunzioni
- Tailwind CSS già configurato; breakpoint `md` = 768px.
- Icone disponibili da `lucide-react`: `Pencil`, `Save`, `Share2`, `Copy`, ecc.
- La bottom nav è `MobileBottomNav` altezza ~80px; la safe area deve considerare anche questo.
- Nessuna modifica Prisma/DB.
- I riferimenti numerici di riga sono indicativi; attenersi al contenuto semantico.

## Open Questions
Nessuna. Le scelte implementative (es. valori esatti di padding) sono lasciate all'implementazione, purché rispettino i vincoli di mobile-only e premium look.

## Criteri di Accettazione

### Rule (pass/fail oggettivi)
- **A-R1**: Nella pagina profilo (`/profile`) il pulsante di modifica, su mobile, non contiene il testo "Modifica profilo" ma solo l'icona matita con aria-label.
- **A-R2**: Nella modale Modifica profilo, su mobile, è presente una CTA salvataggio icona floppy/disk affiancata alla X; la CTA save chiama `handleSubmit` (o la stessa logica di submit del form) senza modifiche alla logica.
- **A-R3**: La modale Modifica profilo ha, su mobile, padding-bottom e safe-area sufficienti per non essere coperta da bottom nav o home indicator iOS; uso visibile di `pb-safe` o `env(safe-area-inset-bottom)` e/o padding ≥ `pb-24`/`pb-28`.
- **A-R4**: Tutte le modifiche di layout (padding, align, grid, flex-direction, text-center, label abbreviate) applicate alle sezioni FR1-FR6 sono racchiuse in classi mobile-only (`md:` per ripristinare desktop oppure applicate solo a `<md`).
- **A-R5**: `tsc --noEmit` passa senza errori introdotti da questo task.
- **A-R6**: `next build` passa senza errori introdotti da questo task.
- **A-R7**: Non sono state toccate logiche backend/API/routing/formule. Verifica: nessuna modifica a `src/lib/*`, `src/app/api/*`, `prisma/*`.

### Rubric (qualitativo 0-2, soglia ≥ 2 per ogni item a fine Review)
- **A-U1 (Centratura & Allineamento hero profilo)**: 0 = peggiorato, 1 = accettabile ma con residui di disallineamento, 2 = LV/OVR/CI perfettamente centrati, allineati verticalmente, spazi ariosi e coerenti; nessun effetto ammassato.
- **A-U2 (UX modale edit profilo)**: 0 = confusionario o coperto da nav, 1 = funzionante, 2 = save/close chiare, safe-area rispettata, raggiungibilità comoda su mobile.
- **A-U3 (Sezione condividi card)**: 0 = peggiorata, 1 = accettabile, 2 = layout centrato e premium; gerarchia titolo/sottotitolo/CTA/copia chiara e bilanciata; wrap controllato.
- **A-U4 (Box Key Metrics OVR/CI/LV)**: 0 = sbilanciato, 1 = accettabile, 2 = tre colonne omogenee, label/valori/divisori allineati e centrati; numeri non "appoggiati in alto".
- **A-U5 (Box record e stats — Streak, Partite/V/G/A ecc.)**: 0 = disallineati, 1 = accettabili, 2 = padding uniforme, icone/titoli/valori/sottotesti centrati e allineati verticalmente; altezze interne armonizzate.
- **A-U6 (Vantaggi esclusivi)**: 0 = sbilanciati, 1 = accettabili, 2 = icona/titolo/descrizione/lock ben integrati, testo compatto ma leggibile, identità gold preservata.
- **A-U7 (Non-regressione desktop)**: 0 = desktop visibilmente peggiorato, 1 = piccole modifiche accettabili, 2 = desktop invariato o migliorato marginalmente senza peggioramenti.
