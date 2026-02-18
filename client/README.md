# Avvio container Docker

Prerequisiti
- Docker / Docker Desktop installato
- `docker compose` o `docker-compose` disponibile

## Setup Completo

1) Posizionati nella root del progetto:

```bash
cd /path/to/ProjectDB
```

2) Crea il file `.env` per il backend (`backend-ts/.env`) con questa riga (usato dai container):

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/projectdb?schema=public
```

3) Avvia i servizi (dalla root del progetto):

```bash
docker compose up -d --build
```


4) Se il DB è vuoto o vuoi applicare manualmente migration + seed, esegui il servizio `migrate` (one-shot):

```bash
docker compose run --rm migrate sh -c "npm install && npx prisma migrate dev"
```

5) Verifiche utili:

```bash
# vedere i log del migrate
docker compose logs migrate --tail 200

# listare le tabelle nel DB
docker compose exec db psql -U postgres -d projectdb -c "\dt"

# contare gli utenti
docker compose exec db psql -U postgres -d projectdb -c "SELECT count(*) FROM users;"

# seguire i log di backend/client
docker compose logs -f backend
docker compose logs -f client

```

6) Per avviare tutto "da zero" (rimuovere il volume DB e ricreare):

```bash
# ferma e rimuovi container + network
docker compose down       

# rimuovi il volume (nome standard: projectdb_db-data)
docker volume rm projectdb_db-data

# ricrea e riavvia
docker compose up -d --build
docker compose run --rm migrate
```




# Client

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
