# Platform — Next.js full-stack (Main-prompt)

Production-minded marketing site, blog (SEO + RSS + sitemap), Clerk authentication with Prisma user sync, Stripe Checkout and subscriptions, PostgreSQL full-text search, custom admin CMS, Resend email, and analytics hooks (GA4 dataLayer + optional PostHog).

## Prerequisites

- Node 20+
- pnpm
- PostgreSQL 16+ (local Docker or hosted e.g. Neon)

## Local setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment**

   Copy [.env.example](.env.example) to `.env` and set at minimum:

   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`
   - `SESSION_SECRET` — long random string
   - **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` (create a webhook endpoint pointing to `/api/webhooks/clerk` for `user.*` events)
   - **Stripe** (test keys for development): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — webhook URL `/api/webhooks/stripe` for `checkout.session.completed`, `customer.subscription.*`
   - **Resend** (optional for email): `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_INBOX_EMAIL` (where contact forms deliver)
   - **Vercel Blob** (optional): `BLOB_READ_WRITE_TOKEN` for media uploads

3. **Database**

   ```bash
   docker compose up -d   # or use a cloud Postgres URL in DATABASE_URL
   pnpm exec prisma migrate deploy
   pnpm run db:seed
   ```

   **Without Docker:** if you use Homebrew PostgreSQL, you can run a dedicated instance on port `5433` from the repo (data in `.pgdata/`):

   ```bash
   /opt/homebrew/opt/postgresql@18/bin/pg_ctl -D .pgdata -l .pg.log start -o "-p 5433"
   ```

4. **Run**

   ```bash
   pnpm dev
   ```

5. **Admin access**

   Sign up via Clerk, then set `publicMetadata.role` to `admin` (or `editor`) in the Clerk dashboard for your user. Open `/admin` — the app syncs roles into PostgreSQL via webhook + `ensureDbUser`.

## Scripts

| Script            | Description                |
| ----------------- | -------------------------- |
| `pnpm dev`        | Next.js dev server         |
| `pnpm build`      | Production build           |
| `pnpm db:migrate` | Apply Prisma migrations    |
| `pnpm db:seed`    | Seed demo content          |

## Production readiness

- **Ready**: App Router pages, Prisma schema, Clerk + Stripe webhook handlers (with idempotency for Stripe), cart + checkout (payment + subscription modes), admin tables, forms with Zod + rate limiting, SEO (metadata, sitemap, robots, RSS), Postgres FTS search abstraction.
- **Harden next**: Use Redis/Upstash for rate limits across instances; verify all Stripe events you need; tighten CSP; add e2e tests; replace placeholder Stripe price IDs in seed with real Dashboard IDs; configure production webhooks and env vars on Vercel.

## Product routes (summary)

- Public: `/`, `/about`, `/services`, `/pricing`, `/blog`, `/search`, `/contact`, `/faq`, legal pages, `/cart`, `/checkout` → cart, `/thank-you`
- Auth: `/login`, `/register` (Clerk)
- Account: `/account`, `/account/profile`, `/account/subscription`, `/account/orders`, `/account/favorites`, `/library`, `/members` → library
- Admin: `/admin` and sub-routes

The full product spec is in [Main-prompt.txt](Main-prompt.txt) in the repo root.
