# Avvio container Docker

Prerequisiti
- Docker / Docker Desktop installato
- `docker compose` o `docker-compose` disponibile

Avviare tutti i servizi (dalla root del progetto)

```bash
docker compose up --build
# oppure in background
docker compose up -d --build
# se usi la vecchia CLI:
docker-compose up --build
```

Log e gestione

```bash
docker compose logs -f            # segui i log di tutti i servizi
docker compose logs -f <servizio> # segui i log di uno specifico servizio
docker compose down               # ferma e rimuove i container di compose
```

Suggerimenti utili
- Se i servizi non si avviano, esegui `docker compose config` per verificare la sintassi del file `docker-compose.yml`.
- Se cambiano le variabili d'ambiente o i Dockerfile, ricostruisci con `--build`.
- Se usi macOS con chip Apple Silicon, verifica l'architettura delle immagini (arm64 vs amd64).



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
