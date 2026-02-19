# ProjectDB — Istruzioni per eseguire l'app

Questo repository contiene il backend TypeScript, il client Angular e altri componenti. Questo README unificato spiega come avviare il progetto in modo rapido (Docker) o in sviluppo locale.

**Struttura rilevante**
- `backend-ts` : API Node + TypeScript (Prisma + Express)
- `client` : applicazione frontend Angular
- `docker-compose.yml` : compose per eseguire DB, backend e client

Prerequisiti
- Docker & Docker Compose (o `docker compose`) per l'opzione consigliata
- Node.js (per sviluppo locale del backend o client)
- Angular CLI (`ng`) se sviluppi il client localmente

Opzione consigliata — Avvio con Docker Compose

1. Creare il file `.env` nella root o in `backend-ts` (se non già presente) con la variabile DATABASE_URL usata dai container. Un esempio usato nei container:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/projectdb?schema=public
```

2. Avviare i servizi (dalla root del progetto):

```bash
docker compose up -d --build
```

3. Applicare migration / seed (one-shot migrate container):

```bash
docker compose run --rm migrate sh -c "npm install && npx prisma migrate dev"
```

4. Comandi utili per debug e gestione:

```bash
# vedere log del migrate
docker compose logs migrate --tail 200

# seguire i log del backend
docker compose logs -f backend

# seguire i log del client
docker compose logs -f client

# fermare e rimuovere container + network
docker compose down

# rimuovere volume DB (ricreare DB pulito)
docker volume rm projectdb_db-data

# ricreare e riavviare
docker compose up -d --build
docker compose run --rm migrate
```




Sviluppo locale — Backend (`backend-ts`)

1. Entrare nella cartella backend:

```bash
cd backend-ts
npm install
```

2. Creare il file `.env` con `DATABASE_URL` puntando al DB di sviluppo (es. Postgres locale).

3. Generare Prisma e applicare migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Avviare in sviluppo:

```bash
npm run dev
```

5. Seed (se necessario):

```bash
npm run seed
```

Sviluppo locale — Client (`client`)

1. Entrare nella cartella client:

```bash
cd client
npm install
```

2. Avviare server di sviluppo Angular:

```bash
ng serve
```

3. Aprire il browser su `http://localhost:4200/`.




Ulteriori informazioni e riferimenti
- README dedicato backend: [backend-ts/README.md](backend-ts/README.md)
- README dedicato client: [client/README.md](client/README.md)


