# Angular + NestJS platform monorepo

Production-minded full-stack reference: **Angular 19 SSR** (`apps/web`), **NestJS 11** API (`apps/api`), **PostgreSQL** with **Prisma**, **Auth0** JWT validation, **Stripe** webhooks, **S3-compatible** uploads, **Resend** email, PostgreSQL search with room to swap in Algolia/Meilisearch, and **PostHog/GA4-ready** analytics hooks.

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io) 9+
- Docker (optional, for local Postgres / MinIO), **or** Homebrew PostgreSQL for DB-only local dev (no Docker)

## Quick start

1. **Install dependencies** (from repo root):

   ```bash
   pnpm install
   ```

2. **Environment** — copy [.env.example](.env.example) to `.env` at the repo root and fill in values. The API loads `../../.env` when started from `apps/api`.

3. **Database** — with **Docker Desktop** running, from the repo root:

   **First time, or after Prisma P1010 / wrong credentials (stale volume):**

   ```bash
   pnpm run stack:reset
   ```

   That script checks Docker, runs `docker compose down -v`, starts Postgres + MinIO, waits for Postgres, then `migrate deploy` + `db:seed`.

   **Normal start** (keeps existing DB volume):

   ```bash
   pnpm run stack:up
   ```

   **Without Docker** (uses Homebrew `postgresql`, data in `.pgdata-local`):

   ```bash
   pnpm run stack:local-pg
   ```

   Postgres is mapped to **127.0.0.1:5434** (see `.env` `DATABASE_URL`). Docker compose uses user `platform`, password `platform`, database `platform` — the local script creates the same.

4. **Run API + web** — two terminals, or one:

   ```bash
   pnpm dev:api
   pnpm dev:web
   ```

   Or both at once: `pnpm dev:all` (API on 3000, Angular on 4200; default `environment.apiUrl` is `http://localhost:3000/api/v1`).

## Auth0 setup

1. Create a **Single Page Application** in the Auth0 Dashboard.
2. Create an **API** with identifier = `AUTH0_AUDIENCE` (same as in `.env`).
3. Set **Allowed Callback URLs** and **Allowed Logout URLs** to `http://localhost:4200` (and production URLs).
4. Set **Allowed Web Origins** to the same.
5. Copy **Domain**, **Client ID**, and API **Audience** into:

   - Root `.env` for the API: `AUTH0_ISSUER`, `AUTH0_AUDIENCE`, `AUTH0_JWKS_URI` (typically `https://<tenant>/.well-known/jwks.json`).
   - [apps/web/src/environments/environment.ts](apps/web/src/environments/environment.ts) (or use build-time replacements): `auth0.domain`, `auth0.clientId`, `auth0.audience`.

**Admin access:** seeded roles include `super_admin`, `admin`, `editor`. New users get `customer`. Grant admin by inserting a `UserRole` row for your user in the database (or extend Auth0 Actions + sync — not included by default).

## Stripe / Resend / S3

- **Stripe:** set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and price IDs as needed. Webhook URL: `POST /api/v1/stripe/webhook` (raw body; Express middleware applied in [apps/api/src/main.ts](apps/api/src/main.ts)).
- **Customer portal:** `POST /api/v1/stripe/billing-portal` (JWT) with body `{ "returnUrl": "https://..." }` — requires a `stripeCustomerId` on one of the user’s subscriptions. The Angular account subscription page calls this for “Manage billing (Stripe)”.
- **Resend:** `RESEND_API_KEY`, `EMAIL_FROM`.
- **MinIO (local):** `docker compose up -d minio` — align `S3_*` variables with [docker-compose.yml](docker-compose.yml).

## Deployment (split or same origin)

- **API:** deploy `apps/api` as a Node process; set `WEB_ORIGIN`, `PUBLIC_APP_URL`, and database URL.
- **Web:** build `apps/web` with `environment.prod.ts` pointing at your public API URL (`NG_APP_*` or replace `environment.prod.ts`).
- **CORS:** API uses `WEB_ORIGIN` (comma-separated for multiple origins).

## Search & spam protection

- **Search:** `GET /api/v1/search?q=` uses **PostgreSQL full-text** (`plainto_tsquery` + `ts_rank_cd`) over published posts, products, and pages, with **ILIKE fallback** if FTS fails. The `SearchPort` interface in [apps/api/src/search/search.port.ts](apps/api/src/search/search.port.ts) is the extension point for Algolia/Meilisearch. Shared types: [packages/shared/src/index.ts](packages/shared/src/index.ts).
- **Contact honeypot:** optional field `website` must be empty; bots that fill it get `400` (see [apps/api/src/forms/forms.controller.ts](apps/api/src/forms/forms.controller.ts) and the contact form in the web app).

## Scripts

| Script        | Description                |
| ------------- | -------------------------- |
| `pnpm dev:api` | Nest API in watch mode    |
| `pnpm dev:web` | Angular dev server          |
| `pnpm dev:all` | API + web together (concurrently) |
| `pnpm run stack:up` | Docker Postgres + MinIO, migrate, seed |
| `pnpm run stack:reset` | `down -v`, fresh volume, then same as `stack:up` (fixes P1010) |
| `pnpm run stack:local-pg` | Homebrew Postgres on 5434 + migrate + seed (no Docker) |
| `pnpm build`   | Build all workspace packages |
| `pnpm run db:migrate` | Prisma migrate (dev) |
| `pnpm run db:seed`    | Seed demo data        |

## What is production-ready vs scaffolded

- **Ready:** Prisma schema, migrations, Nest modules (auth/RBAC pattern, CRUD, throttling, CORS, Stripe idempotency table), Angular routes, SSR build, admin tables backed by real endpoints.
- **Harden next:** Auth0 role sync, full Stripe line-item mapping from cart to Price IDs, virus scanning on uploads, E2E tests, stricter CSP, rate limits per IP, production logging/metrics.
