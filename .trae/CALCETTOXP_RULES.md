QUESTE REGOLE HANNO PRIORITÀ SULLE SCELTE IMPLEMENTATIVE NON ESPLICITAMENTE RICHIESTE DALL’UTENTE.

---

## 1. Lingua & Comunicazione
- UI sempre in italiano.
- Codice, commenti interni e documentazione tecnica in inglese.

## 2. Architettura UI / UX
- Mobile-first.
- Prima di ogni task UI: leggere queste regole.
- Test UI reale quando richiesto, non solo analisi classi Tailwind.

### Menu mobile
- Overlay `fixed` sopra tutta la pagina.
- Contenitore `100dvh`.
- `z-index` alto e corretto (nessun bleed / contenuto che trapassa).
- Body scroll lock mentre il menu è aperto.
- Nessun elemento della pagina sotto deve mescolarsi col pannello.

### Cookie banner
- Il banner iniziale richiede scelta esplicita.
- Nessun pulsante X di chiusura iniziale per bypassare la scelta.
- Pulsanti: SOLI NECESSARI · PERSONALIZZA · ACCETTA TUTTI.

## 3. Autenticazione
- Google è l’unico login supportato.
- Usare l’avatar Google reale per l’utente autenticato (`session.user.image`).
- Dopo `signOut` la UI deve tornare immediatamente allo stato “ACCEDI”; niente sessione client cache stale (usare `refetchOnWindowFocus` su SessionProvider per forzare refresh).

## 4. Anagrafica Giocatore
- Username unico per giocatore.
- **Non duplicare** “Username” e “Nickname” nella UI: un solo campo visibile all’utente.
- Se il DB richiede ancora `nickname` come NOT NULL, popolarlo server-side con il valore di `username`, senza chiedere due volte lo stesso dato.
- Username offensivi / volgari / blasfemi / denigratori sono **vietati**.
- Validazione username offensivo SEMPRE **server-side** (oltre a eventuali controlli client).

## 5. Progressione Carriera
- **Career Index** · delta per partita **sempre compreso tra -20 e +40** (estremi inclusi).
- **OVR** deriva solo ed esclusivamente dal Career Index.
- Piano **PRO** non modifica XP, Career Index, OVR o ranking: pay-for-cosmetics / pay-for-analytics, mai pay-to-win.

## 6. Sviluppo e modifiche
- Non modificare file o feature fuori dallo scope richiesto.
- **NON dichiarare MAI** “testato”, “Vercel OK”, “funziona”, “build green” se non è stato verificato realmente.
- Distinguere sempre e esplicitamente: `typecheck` · `build locale` · `test browser reale` · `deploy production`.
- Se un test non è possibile, dichiararlo esplicitamente invece di inventare conferme.
- Non committare log o build artifacts inutili nel repo.

## 7. Database · Prisma
- **MAI** eseguire `prisma reset`, `prisma db push --force-reset`, `DROP`, `TRUNCATE` o operazioni distruttive in ambiente production.
- Le migration SQL devono essere sempre UTF-8 senza BOM, senza caratteri NUL.
- Usare `DATABASE_URL` fornito da Vercel / Neon. Nessun hardcode di credenziali.
- Prima di modifiche DB, verificare sempre lo stato esistente (schema + migrazioni già applicate).

---

_Queste regole sono la sorgente della verità. Copia identica contenuta anche in `project_memory.md` della memoria TRAE dedicata al progetto._
