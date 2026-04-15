# Astro + separate admin + shared API platform

Production-minded monorepo: **Astro** public site (`apps/web`), **React + Vite** admin (`apps/admin`), shared **Hono** API (`packages/api`), **PostgreSQL** + **Prisma** (`packages/db`), with **Stripe**, **Resend**, and **S3-compatible** upload hooks.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local PostgreSQL)

## Quick start

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Start Postgres (mapped to host port **5433** to avoid clashing with a local Postgres on 5432):

   ```bash
   docker compose up -d
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Apply database migrations and seed demo data:

   ```bash
   DATABASE_URL="postgresql://platform:platform@127.0.0.1:5433/platform" pnpm --filter @repo/db exec prisma migrate deploy
   DATABASE_URL="postgresql://platform:platform@127.0.0.1:5433/platform" pnpm db:seed
   ```

   If `migrate deploy` reports “already applied”, that is expected after the initial migration.

5. Run everything in dev (API, web, admin):

   ```bash
   pnpm dev
   ```

   - Public site: http://localhost:4321  
   - Admin: http://localhost:5173 (sign in with `admin@example.com` / `password123`)  
   - API: http://localhost:3001/health  

Ensure `.env` includes `PUBLIC_API_URL=http://localhost:3001`, `PUBLIC_SITE_URL=http://localhost:4321`, and `PUBLIC_ADMIN_URL=http://localhost:5173` so CORS and absolute links behave.

## Environment variables

See [.env.example](.env.example). Notable groups:

- **Database**: `DATABASE_URL`
- **Auth**: `SESSION_SECRET`, cookie names
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (webhook route: `/v1/stripe/webhook`)
- **Resend**: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- **S3 / R2**: `S3_*` and `S3_PUBLIC_BASE_URL`
- **Admin (Vite)**: `VITE_PUBLIC_API_URL` (defaults to `http://localhost:3001` in code)

## Production readiness

| Area | Status |
|------|--------|
| Auth + RBAC + sessions | Implemented (Argon2, HttpOnly cookies, admin vs member scopes) |
| CMS admin CRUD | Core resources (posts, pages, products, navigation, settings, media presign) |
| Public SEO | Titles/descriptions, canonical, OG/Twitter basics, JSON-LD on homepage, sitemap + robots |
| Stripe | Checkout for cart + subscription; webhook updates orders/subscriptions (configure keys) |
| Search | Postgres `tsvector` queries in API; public + admin search endpoints |
| Analytics | `@repo/analytics` helpers + env-driven snippet placeholders |

**Harden next:** rate limits beyond DB bucket, CSRF strategy for cross-site admin, full HTML sanitization for rich text, e2e tests, CI migration pipeline, secrets rotation, and production-grade logging/metrics.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Turbo runs `dev` in API, web, and admin |
| `pnpm build` | Build web + admin (API build is a no-op placeholder) |
| `pnpm db:migrate` | `prisma migrate deploy` |
| `pnpm db:seed` | Seed demo data |

## License

Sample / educational codebase—replace branding, legal copy, and keys before any public launch.
