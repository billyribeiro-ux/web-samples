# Vue + Express platform

Monorepo: **Vue 3 (Vite) SPA**, **Express + Prisma + PostgreSQL**, shared **Zod** schemas, **Tailwind**, **VeeValidate** (contact form patterns), **Stripe** (checkout + webhooks), **Resend** (email stubs), **S3** (presigned uploads when configured), **PostgreSQL full-text search** with a swappable implementation path.

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ (local or Docker)

## Quick start

1. **Install dependencies** (from repo root):

   ```bash
   pnpm install
   pnpm --filter @platform/shared build
   ```

2. **Start PostgreSQL** (optional Docker):

   ```bash
   docker compose up -d
   ```

3. **API environment** — copy [`apps/api/.env.example`](apps/api/.env.example) to `apps/api/.env` and set `DATABASE_URL`, `SESSION_SECRET` (at least 16 characters).

4. **Migrate and seed**:

   ```bash
   cd apps/api
   pnpm exec prisma migrate deploy
   pnpm exec prisma db seed
   ```

   Seeded logins:

   - Admin: `admin@example.com` / `Testpass123!`
   - Member: `member@example.com` / `Testpass123!`

5. **Web environment** — copy [`apps/web/.env.example`](apps/web/.env.example) to `apps/web/.env`. For local dev, keep `VITE_API_URL` pointing at the Vite dev server origin so requests use the **proxy** (`/api` → API).

6. **Run both apps**:

   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:5173  
   - API: http://localhost:3001  
   - Health: http://localhost:3001/health  

The Vite dev server proxies `/api` to the API, so cookies and CSRF work same-origin during development.

## Environment highlights

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session signing |
| `CORS_ORIGIN` | SPA origin (e.g. `http://localhost:5173`) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Payments (optional in dev) |
| `RESEND_API_KEY` | Email (optional; logs to console if unset) |
| `S3_*` | Presigned uploads (optional) |

## Production deployment

- **Frontend (Vercel/Netlify):** build `apps/web`, set `VITE_API_URL` to your public API URL (or keep same-origin if the static host rewrites `/api` to the API).
- **API (Railway/Render/Fly.io):** deploy `apps/api`, run `prisma migrate deploy` on release, set env vars. For session cookies across subdomains, use a shared parent domain (`Domain=.yourdomain.com`) or a reverse proxy so the SPA and API are same-site.
- **Webhooks:** Stripe webhook URL: `https://<api-host>/api/v1/webhooks/stripe` (raw body; signature verification enabled when `STRIPE_WEBHOOK_SECRET` is set).

## What is production-ready vs scaffolded

- **Ready:** Auth (session + CSRF), RBAC, content/products CRUD, orders/checkout flow, Stripe webhook handlers, search (Postgres FTS), forms with rate limits, SEO routes (sitemap/robots), admin list views, seed data.
- **Harden next:** Full editor UI for all CMS fields, audit log UI, background jobs for email, advanced inventory/discount rules, Algolia/Meilisearch provider swap.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run API + web in parallel |
| `pnpm build` | Build all workspaces |
| `pnpm db:migrate` | Prisma migrate (dev) |
| `pnpm db:seed` | Run seed |
