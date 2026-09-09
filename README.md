# CalcettoXP

Trasforma ogni calcetto nella tua carriera.

## Configurazione

1. Copia il file `.env.example` in `.env` e compila le variabili d'ambiente:

```bash
cp .env.example .env
```

2. Installa le dipendenze:

```bash
npm install
```

3. Inizializza il database Prisma:

```bash
npx prisma migrate dev
```

4. Esegui il seed del database (opzionale):

```bash
npm run prisma:seed
```

## Sviluppo

Avvia il server di sviluppo:

```bash
npm run dev
```

## Build

Crea la build di produzione:

```bash
npm run build
```

Avvia il server di produzione:

```bash
npm start
```

## Lint

```bash
npm run lint
```
