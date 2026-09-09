# Debug Session: prisma-p1012-relation-match

- **Status:** [OPEN]
- **Start date:** 2026-09-09
- **Symptom:** Vercel build error P1012: `The relation field confirmations on model Match is missing an opposite relation field on the model MatchConfirmation.`
- **Environment:** Vercel production build; Windows local environment unknown Node/npm availability

## Hypotheses (falsifiabili)
1. **H1 — Manca campo relazione opposta** : In `MatchConfirmation` esiste `matchId FK` ma NON c'è il campo `match Match @relation(...)` con le stesse annotations dell'opposto. Prisma richiede la relazione definita su ENTRAMBI i modelli. **✅ CONFERMATO** (fix applicato)
2. **H2 — `fields`/`references`/`onDelete` non allineati**: La relazione esiste ma disallineata. **❌ RIGETTATA H1 era causa vera**
3. **H3 — Chiave composta / multi-relazioni duplicate**: **❌ RIGETTATA — una sola relazione Match↔MatchConfirmation**
4. **H4 — Altre relazioni schema con lo stesso bug P1012**: **❌ RIGETTATA — audit 16 relazioni completato, solo Match/MatchConfirmation mancava**
5. **H5 — Prisma version mismatch**: **⚠️ NON VERIFICATO — Node/npm non disponibili localmente**

## Evidence collected
- `Match` (L175): definisce `confirmations MatchConfirmation[]`
- Pre-fix `MatchConfirmation` (L307-315): aveva SOLO `matchParticipantId` + relazione `matchParticipant MatchParticipant` → mancava completamente campo verso `Match`
- Altre 15 relazioni su 16 modelli → tutte complete bidirezionali (verifica statica manuale)
- GetDiagnostics → 0 errori TypeScript / 0 errori schema

## Fix applied — ONLY MatchConfirmation, nessun altro modello toccato
File: `prisma/schema.prisma` model `MatchConfirmation`
- ✅ ADDED field: `matchId String` (foreign key column required by Prisma @relation `fields:[matchId]`)
- ✅ ADDED relation: `match Match @relation(fields: [matchId], references: [id], onDelete: Cascade)` — esattamente il pattern richiesto
- ✅ ADDED index: `@@index([matchId])` per performant join Match → confirmations (stesso stile altri indici del modello)
- **Nessun campo duplicato creato**; nessuna modifica a Match, MatchParticipant o altri modelli multiplayer future

## Post-fix verification — STATIC ONLY (ambiente locale Node NON installato)
- prisma format: ⚠️ SKIPPED — richiede `npx prisma format` (node mancante)
- prisma validate: ⚠️ SKIPPED — richiede `npx prisma validate` (node mancante)
- prisma generate: ⚠️ SKIPPED — richiede `npx prisma generate` (node mancante)
- npm install: ⚠️ SKIPPED — node non installato
- npm run build: ⚠️ SKIPPED — node non installato
- VS Code Prisma schema diagnostics (GetDiagnostics): ✅ 0 errori
- TypeScript project diagnostics (GetDiagnostics): ✅ 0 errori

## Comandi che UTENTE DEVE ESEGUIRE LOCALMENTE (dopo installazione Node.js LTS 20.x):
```bash
cd C:\Users\viva_\Desktop\CALCETTOXP
# 1. Dipendenze
npm install
# 2. Prisma — deve PASS — se fallisce, riporta errore P1012 è risolto?
npx prisma format
npx prisma validate
npx prisma generate
# 3. Build Vercel-equivalente locale
npm run build
npm run lint
```
