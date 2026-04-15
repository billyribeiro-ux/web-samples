# Acme Platform (SvelteKit)

Production-minded full-stack reference: marketing site, blog with SEO routes, Lucia session auth, RBAC admin, Stripe Checkout + webhooks, Postgres + Drizzle, Zod form actions, S3 presigned uploads, Resend email hooks, and Postgres-backed search.

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io) 9+ (`corepack enable` then `corepack prepare pnpm@9.15.9 --activate`, or install globally)
- PostgreSQL 14+ (local, Neon, RDS, etc.)

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Set at least `DATABASE_URL` and `PUBLIC_APP_URL`. See comments in [`.env.example`](.env.example) for Homebrew vs Docker examples (numeric port required).

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create the database (example name `seven`) if it does not exist, e.g. `createdb seven` or `psql -c "CREATE DATABASE seven"`.

4. Push the schema (`db:push` uses `--force` so it works in non-interactive shells):

   ```bash
   pnpm db:push
   ```

5. Seed demo data (roles, admin user, posts, products, plans, navigation):

   ```bash
   pnpm seed
   ```

6. Start the dev server:

   ```bash
   pnpm dev
   ```

### Demo accounts (after seed)

- **Admin:** `admin@example.com` / `Password123!` — access `/admin`
- **Member:** `member@example.com` / `Password123!`

### Stripe

- Set `STRIPE_SECRET_KEY`, `PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- Point Stripe CLI or dashboard webhooks to `/api/webhooks/stripe` (POST).
- Checkout requires a **logged-in** user (cart checkout redirects anonymous users to login).

### Object storage (optional)

- Set `S3_BUCKET`, `S3_REGION`, keys, and `S3_PUBLIC_BASE_URL` for public URLs.
- Admins can request presigned uploads via `POST /api/admin/presign` (JSON: `mimeType`, `sizeBytes`).

### Email (optional)

- Without `RESEND_API_KEY`, outbound mail is logged to the console (verification and password reset still run).

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `pnpm dev`        | Dev server                   |
| `pnpm build`      | Production build (Vercel)    |
| `pnpm check`      | Typecheck                    |
| `pnpm db:push`    | Apply Drizzle schema to DB   |
| `pnpm seed`       | Seed demo content            |

## Production notes

- Use a **pooled** `DATABASE_URL` on serverless hosts; run migrations/seed with a **direct** connection in CI if required.
- Configure `secure` cookies and `PUBLIC_APP_URL` for your domain.
- Replace legal copy under `/privacy-policy`, `/terms`, and `/cookies`.
- Harden with rate limiting (e.g. Redis), WAF, backups, and monitoring beyond this reference.

## Stack

SvelteKit 2, Svelte 5, Tailwind CSS 4, Drizzle ORM, Lucia, Stripe, Zod, Resend, AWS S3-compatible storage.
