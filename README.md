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


1. Creare il file `.env` in `backend-ts` (se non già presente) con la variabile DATABASE_URL usata dai container. 

Questo è il contenuto che deve esserci nel file `.env` usato dal progetto:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/projectdb?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="projectdb"
REDIS_URL="redis://redis:6379"
PORT = 5000

JWT_ACCESS_TOKEN_SECRET=9bda4dc7c1675a64d55f36f5e7f11e593e83d53b53e92f78b96d3b45ff0f7f25b7e98f95b7c758da58c0d4b2a896f42743a8b379c6d25716e49b5ccab14bfa5f
JWT_REFRESH_TOKEN_SECRET=5d2c38a5a9b3eaf994c22d2e415ea22a7a8f8b8e56b9c7127cfb6ec8ce7a5932f1c9b44b9e51689ff55c07b95eb739bb5ff320a1db1f7c6c3e2e0d3a7d94f093

BCRYPT_SALT_ROUNDS=10
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



5. Utenti e credenziali di Test

Questi utenti sono quelli creati dallo script di seed (`backend-ts/prisma/seeds`). Nel database le password sono memorizzate come hash; qui sono elencate in chiaro, per permettere il login in ambiente di sviluppo.

- **Admin**: email: `admin@example.com` — password: `admin` — ruolo: `ADMIN`
- **Airline (Lufthansa)**: email: `lufthansa@example.com` — password: `Lufthansa` — ruolo: `AIRLINE`
- **Airline (Ryanair)**: email: `ryanair@example.com` — password: `Ryanair` — ruolo: `AIRLINE`
- **Passenger (test)**: email: `test@example.com` — password: `test` — ruolo: `PASSENGER`

Queste credenziali devono essere usate esclusivamente durante lo sviluppo.







## Sviluppo locale — Backend (`backend-ts`)

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


