# Tasks: Mobile UI Polish

Implementazione end-to-end del polish mobile. Tutti i task sono mobile-only (breakpoint < md).

- Spec: [spec.md](./spec.md)
- Modalità: Mobile-first, desktop invariato o migliorato marginalmente.
- Regola di scoping: ogni modifica di layout/padding/allineamento va protetta con classi Tailwind `md:` (inversione sul desktop) o applicata solo su mobile.

---

## Task 1: Profile Hero mobile — LV/OVR/CI + pulsante edit solo icona

**File target**: `src/app/profile/page.tsx` (sezione hero card, righe 190–358 circa)

**Obiettivo**: Rendere l'hero mobile più arioso, centrare LV/OVR/CI, sostituire il pulsante "Modifica profilo" con sola icona matita + aria-label.

**Lavoro**:
1. Ispezionare il wrapper del pulsante EditProfileModalWrapper (riga 336-354) e il componente `MobileStatPill` (riga 662-690).
2. Nel componente `EditProfileModalWrapper`/pulsante che renderizza la CTA, su mobile (classe `md:hidden` sul testo + `aria-label` sul bottone con sola icona `Pencil`). Se il wrapper esterno non consente override, sostituire localmente il button call o passare prop `iconOnlyMobile`.
3. Aggiustare la grid/gap del blocco LV/OVR/CI:
   - Su mobile: padding aumentato, eventualmente flex-col interna per ogni pill invece che flex-row, maggiore `gap` e `py` nel wrapper `bg-bgSecondary/60`.
   - Label pill + valore + icona tutti centrati verticalmente e orizzontalmente.
4. Valutare se sulla hero, sotto l'avatar, inserire una riga dedicata ai 3 stat pill invece che condividere lo spazio col pulsante edit, per evitare compressione.
5. Verificare che il pulsante edit resti cliccabile (hit area ≥ 40x40px).

**Criteri padre coperti**: A-R1, A-U1, A-R4.

**Test Requirements (TR)**:
- **T1-R1** (rule): Su viewport 390px il testo "Modifica profilo" NON è presente sul pulsante edit; è visibile solo l'icona matita con `aria-label="Modifica profilo"`.
- **T1-R2** (rule): Il desktop (`md:` e oltre) mantiene la CTA testuale invariata.
- **T1-U1** (rubric, soglia 2): Centratura/allineamento LV/OVR/CI mobile, spazi ariosi e coerenti (2=ottimo, 1=sufficiente).
- **T1-U2** (rubric, soglia 2): Hit area e stile pulsante edit su mobile chiari e cliccabili.

**Note**:
- Non toccare `EditProfileModal.tsx` qui; solo il trigger nel profilo (o il wrapper `EditProfileModalWrapper`).

**Status**: pending

---

## Task 2: Edit Profile Modal — CTA save in alto + Safe Area mobile

**File target**: `src/components/profile/EditProfileModal.tsx`

**Obiettivo**: Aggiungere CTA save icona floppy accanto alla X; sistemare safe-area e padding per non collidere con bottom nav.

**Lavoro**:
1. Importare icona `Save` (o `Save as SaveIcon`) da `lucide-react`.
2. Nel header sticky (riga 179-192) aggiungere un gruppo di azioni:
   - a destra: prima il pulsante `Save` (disk) poi la `X`.
   - Save: stesso stile `w-10 h-10 rounded-full bg-white/5 hover:bg-white/10`; `type="submit"` (o chiamare `handleSubmit` via `ref`/`.click()` sul form se submit via bottone esterno non funziona). Alternativa: avvolgere header nel form oppure usare `<button form="edit-form">` assegnando un id al `<form>`.
3. Assegnare `id="edit-profile-form"` al `<form onSubmit=...>` per poter usare `form="edit-profile-form"` sul pulsante save in header.
4. Nel wrapper contenitore della modale, aggiungere:
   - su mobile: `pb-24 md:pb-0` (per la bottom nav) e/o `pb-[calc(env(safe-area-inset-bottom)+6rem)]`.
   - valutare `animate-in` con `slide-in-from-bottom` già presente; non toccare.
5. Attuale riga footer dei bottoni (Annulla/Salva modifiche, riga 334-354):
   - MANTENERE entrambi i bottoni invariati per coerenza (specialmente su desktop).
   - Su mobile il nuovo save in alto agisce come CTA secondaria chiara.
6. Accessibilità: salvataggio header con `aria-label="Salva modifiche"`.

**Criteri padre coperti**: A-R2, A-R3, A-U2, A-R4.

**TR**:
- **T2-R1** (rule): Modale mobile: pulsante disk visibile accanto alla X, con `aria-label="Salva modifiche"`; al click sottomette lo stesso form (verificare che invochi la stessa logica, es. `form="edit-profile-form"` o test log).
- **T2-R2** (rule): Modale mobile: `padding-bottom` + safe-area presenti (inserire una classe mobile-only).
- **T2-R3** (rule): Desktop: header non peggiora (layout inalterato o migliore); le due CTA in basso rimangono invariate.
- **T2-U1** (rubric, soglia 2): UX modale mobile chiara, safe area rispettata e contenuti sempre raggiungibili.

**Status**: pending

---

## Task 3: Sezione "Condividi la mia card" (dashboard)

**File target**: `src/app/dashboard/page.tsx` (riga 344-400 circa) + eventualmente `src/components/share/ShareCardButton.tsx` per una variante mobile.

**Obiettivo**: Layout più premium, centrato, gerarchia chiara; evitare due righe brutte o elementi sparsi.

**Lavoro**:
1. Sostituire il flex row/col misto con struttura dedicata:
   - mobile: centrato, titolo + sottotitolo + blocco azioni (share + copy) tutti sotto di loro o affiancati se lo spazio lo consente.
   - desktop: layout attuale pressoché invariato.
2. Usare wrapper `text-center` su mobile per titolo/sottotitolo, con icona share più grande o posizionata meglio.
3. Blocco azioni share + copy:
   - affiancare i due bottoni su una riga centrata, con gap coerente.
   - valutare se su mobile il "Copia link" può essere solo icona + testo corto per evitare wrap.
4. Se utile, modificare `ShareCardButton.tsx` per accettare una prop `mobileCompact?: boolean` o una variante, ma senza rompere chiamate esistenti.
5. Non cambiare URL o logica di share/copy.

**Criteri padre coperti**: A-U3, A-R4.

**TR**:
- **T3-R1** (rule): Desktop layout pressoché invariato rispetto all'attuale (stesso ordine, stesso align a destra CTA).
- **T3-U1** (rubric, soglia 2): Sezione condividi mobile: centratura, gerarchia, distribuzione e bilanciamento premium.

**Status**: pending

---

## Task 4: Box Key Metrics OVR · CI · LV (dashboard)

**File target**: `src/app/dashboard/page.tsx` (riga 402-459)

**Obiettivo**: Tre colonne pulite, coerenti, centrati label, valori e divisori.

**Lavoro**:
1. Ispezionare la grid 3-col.
2. Su mobile:
   - Uniformare il padding verticale interno a ogni colonna (`py-2 md:py-0` o simile).
   - Allineamento verticale dei valori numerici; i valori troppo grandi sul desktop restano; su mobile ridurre leggermente il testo se serve (es. `text-xl sm:text-2xl` invece di `text-2xl sm:text-3xl` per OVR, se utile).
   - Spaziatura label (`mb-1.5`) e valori coerente tra le tre colonne.
   - Divisore centrale (`border-x`) con stesso align del contenuto.
3. Verificare che i numeri non siano "appoggiati in alto" ma centrati verticalmente: usare `flex flex-col justify-center items-center h-full` nel contenitore delle 3 celle.

**Criteri padre coperti**: A-U4, A-R4.

**TR**:
- **T4-R1** (rule): Layout desktop invariato; le stesse classi `md:` ripristinano il font-size/alignment desktop.
- **T4-U1** (rubric, soglia 2): Tre colonne mobile omogenee, label/valori/divisori centrati e allineati verticalmente.

**Status**: pending

---

## Task 5: Box Streak/Settimana/Stagione/Miglior CI + Partite/V/G/A

**File target**:
- `src/app/dashboard/page.tsx` (sezione 4 metrics: riga 592-693; sezione stats 2x2 + win rate riga 914-976)
- `src/app/stats/page.tsx` (StatCard righe 692-717, RecordBox righe 813-836)

**Obiettivo**: Uniformare padding, centrare icone/titoli/valori/sottotesti, armonizzare altezze.

**Lavoro**:
1. Sezione "4 metrics compatte" (Streak ecc.) dashboard:
   - Su mobile aumentare leggermente il padding `p-3` → `p-3.5` o `py-4 px-3`.
   - Ogni card: `flex flex-col items-center justify-center text-center` (o analogo) invece che lasciato allineato a sinistra, per evitare sensazione "sbilanciata a sx".
   - `mt-auto` sul sottotesto va mantenuto per height uniforme; assicurarsi che non spinga il contenuto in alto.
   - Valori numerici: centrati orizzontalmente.
2. Sezione stats 2x2 + Win Rate dashboard:
   - Stesso pattern: mobile text-center, padding verticale aumentato, align verticale.
3. Stats page `StatCard`/`RecordBox`:
   - Applicare lo stesso trattamento mobile-only (centratura, padding extra verticale).
4. Verificare `min-h-*` o altezze uniformi se utile.

**Criteri padre coperti**: A-U5, A-R4.

**TR**:
- **T5-R1** (rule): I testi/valori risultano centrati orizzontalmente su mobile in questi box (verifica visiva a 390px).
- **T5-R2** (rule): Desktop non viene alterato l'allineamento (testi/valori restano allineati a sinistra come oggi).
- **T5-U1** (rubric, soglia 2): Armonia interna, padding e allineamento verticale percepiti come premium; nessun box sembra vuoto o compresso.

**Status**: pending

---

## Task 6: Vantaggi esclusivi (PRO upsell, dashboard)

**File target**: `src/app/dashboard/page.tsx` (riga 1023-1132 circa)

**Obiettivo**: Riallineare icona/titolo/descrizione/lock icon; compatti ma leggibili; gold identity.

**Lavoro**:
1. Grid 2-col mobile; ogni card:
   - aumentare leggermente padding interno (`p-3.5 md:p-4`) e garantire altezze uniformi.
   - icona, titolo e descrizione allineati e centrati meglio (eventualmente centrati orizzontalmente su mobile, lasciando left-align sul desktop).
   - lock icon in alto a destra: assicurarsi che non si sovrapponga al contenuto (margine di sicurezza).
2. Descrizioni (es. "Night · Elite · Neon"): testo compatto ma non troppo piccolo; `text-[11px]` coerente.
3. CTA "Scopri PRO" inferiore: mantenere invariata ma verificare centratura mobile.

**Criteri padre coperti**: A-U6, A-R4.

**TR**:
- **T6-R1** (rule): Desktop layout invariato (icone left-aligned, testo left-aligned); le modifiche di centratura sono mobile-only.
- **T6-U1** (rubric, soglia 2): Box Vantaggi esclusivi mobile: armonia, icona/titolo/descrizione/lock bilanciati, gold identity preservata.

**Status**: pending

---

## Task 7: Quality & Verify — typecheck + build + visual check

**File target**: nessuno (test).

**Obiettivo**: Verifiche obbligatorie e controllo visivo mobile.

**Lavoro**:
1. Eseguire `tsc --noEmit` nel repo root.
2. Eseguire `next build` nel repo root.
3. Avviare dev server `next dev` e aprire browser a 390px, 412-430px per controllare:
   - profile hero
   - edit profile modal (apribile da profilo)
   - share section mobile
   - key metrics box mobile
   - streak/settimana/stagione/miglior CI
   - partite/vittorie/gol/assist
   - vantaggi esclusivi
4. Annotare esiti.

**Criteri padre coperti**: A-R5, A-R6, A-R7, A-U7.

**TR**:
- **T7-R1** (rule): `tsc --noEmit` exit code 0.
- **T7-R2** (rule): `next build` exit code 0.
- **T7-R3** (rule): Nessuna modifica in `src/lib/`, `src/app/api/`, `prisma/`.
- **T7-U1** (rubric, soglia 2): Desktop non peggiorato visivamente (A-U7).
- **T7-U2** (rubric, soglia 2): Verifica visiva 390/412/430px passa senza disallineamenti o wrap anomali.

**Status**: pending
