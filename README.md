# Flights-App

This repository contains a full-stack application composed of:

- **Backend:** Node.js + Typescript (Express + Prisma)
- **Frontend:** Angular client application
- **Infrastracture:** Docker Compose for database, backend and frontend services

This guide explains how to run the project using Docker

## Project Structure
- `backend-ts` → REST API (Node.js, TypeScript, Prisma, Express)
```
backend-ts/
├── prisma/
│   └── seeds/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── dtos/
│   ├── routes/
│   ├── services/
│   ├── types/
│   │
│   ├── utils/
│   │   ├── helpers/
│   │   └── middlewares/
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
```
- `server` → old flask REST API version 
- `client` → Angular frontend application
- `docker-compose.yml` → Orchestration for database, backend, and frontend

## Run the App

1. **Environment Configuration**

Create a .env file inside the backend-ts directory:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/projectdb?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="projectdb"
REDIS_URL="redis://redis:6379"
PORT = 5000

JWT_ACCESS_TOKEN_SECRET=secret_key_access_token
JWT_REFRESH_TOKEN_SECRET=secret_key_refresh_token

BCRYPT_SALT_ROUNDS=10
```

2. **Start All Services**
From the project root:
```bash
docker compose up -d --build
```

Once completed, the application will be available at:
`http://localhost:4200/`


## Test Users (Development Only)

These users are created via the seed script (`backend-ts/prisma/seeds`)

- **Admin**: email: `admin@example.com` — password: `admin` — ruolo: `ADMIN`
- **Airline (Lufthansa)**: email: `lufthansa@example.com` — password: `Lufthansa` — ruolo: `AIRLINE`
- **Airline (Ryanair)**: email: `ryanair@example.com` — password: `Ryanair` — ruolo: `AIRLINE`
- **Passenger (test)**: email: `test@example.com` — password: `test` — ruolo: `PASSENGER`

Queste credenziali devono essere usate esclusivamente durante lo sviluppo.

## API Documentation
Once the backend is running, access the Swagger documentation at:
`http://localhost:5000/api-docs`
