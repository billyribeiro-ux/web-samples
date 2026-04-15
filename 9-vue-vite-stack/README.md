# Vue + Express + Prisma business platform (demo)

Monorepo with a **Vue 3 + Vite SPA** (`apps/web`), **Express API** (`apps/api`), **PostgreSQL** + **Prisma** (`packages/db`), shared **Zod** schemas (`packages/shared`), **cookie sessions**, **CSRF** on mutating requests, **Stripe**-ready checkout, **Resend**-ready email, **S3**-ready media presigns, PostgreSQL **full-text search**, and an **admin CMS** backed by real CRUD routes.

## Prerequisites

- Node.js 22+ (or current LTS)
- [pnpm](https://pnpm.io) 9+
- Docker (optional, for local Postgres)

## Environment variables

### API — [apps/api/.env.example](apps/api/.env.example)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `WEB_ORIGIN` | Allowed CORS origin + cookie `localhost` flows (e.g. `http://localhost:5173`) |
| `STRIPE_SECRET_KEY` | Stripe server secret (optional for local) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` | Checkout redirects |
| `RESEND_API_KEY` | Transactional email (optional; logs when absent) |
| `S3_*` | Presigned uploads (optional) |

### Web — [apps/web/.env.example](apps/web/.env.example)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL (default `http://localhost:4000`) |
| `VITE_SITE_URL` | Canonical site origin for SEO helpers |

## Database (Docker)

Compose maps Postgres to host port **55432** to avoid clashing with a local Postgres on 5432:

```bash
docker compose up -d
cd packages/db
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/platform" pnpm exec prisma db push
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/platform" pnpm exec prisma db seed
```

## Local development

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:5173  
- API: http://localhost:4000 (e.g. http://localhost:4000/healthz)

### Demo users (seed only — **do not use in production**)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | SUPERADMIN |
| editor@example.com | password123 | EDITOR |
| customer@example.com | password123 | CUSTOMER |

## Production notes

- Deploy the **SPA** to Vercel/Netlify (static build) and the **API** to Railway/Render/Fly.io (or any Node host).
- Set `WEB_ORIGIN` to the **public web** origin; ensure CORS + cookie `Secure`/`SameSite` match your domains.
- Point `robots.txt` / `sitemap.xml` consumers at your public API host or reverse-proxy `/api` on the same site as the SPA.
- Configure Stripe webhooks to `POST /api/v1/webhooks/stripe` with the **raw** body (already mounted before JSON parsing).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run API + web together |
| `pnpm db:push` | `prisma db push` against `DATABASE_URL` |
| `pnpm db:seed` | Run seed |
| `pnpm build` | Build shared, db client, API, web |

## Architecture

See [Main-Prompt.txt](Main-Prompt.txt) for the full product specification. This repo implements the core vertical slice: auth, public content APIs, blog + FTS search, cart + Stripe checkout session, subscription checkout + billing portal stubs, member library gating, admin tables, forms, SEO routes (`/api/v1/seo/*`), and analytics hooks on the client.
