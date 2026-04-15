# Astro Business Platform

Production-minded reference app: **Astro 6** (SSR + islands), **PostgreSQL**, **Prisma 7**, **Better Auth**, **Stripe**, **Resend**, **S3-compatible uploads**, **Zod** validation, and a **custom admin CMS** at `/admin`.

## Prerequisites

- Node.js 22+
- PostgreSQL (local Docker Compose file included)
- Optional: Stripe CLI for webhooks, MinIO for S3-compatible storage

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set at least:

   - `DATABASE_URL` — PostgreSQL connection string
   - `BETTER_AUTH_SECRET` — long random string (32+ chars)
   - `BETTER_AUTH_URL` and `PUBLIC_SITE_URL` — usually `http://localhost:4321` in dev

3. **Database**

   ```bash
   docker compose up -d   # or use hosted Postgres
   npx prisma migrate deploy
   npm run db:seed
   ```

   If you created the DB from scratch without prior migrations:

   ```bash
   npx prisma migrate deploy
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:4321](http://localhost:4321).

### Seed credentials

After `npm run db:seed`:

- Admin: `admin@example.com` / `Admin123!`

## Stripe

1. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PUBLIC_STRIPE_PUBLISHABLE_KEY` to `.env`.
2. Create Products/Prices in Stripe and copy Price IDs onto `Plan` rows (`stripePriceMonthlyId` / `stripePriceYearlyId`) and `Product` rows (`stripePriceId`), or extend the seed script.
3. Point the Stripe webhook to `/api/stripe/webhook` (local: `stripe listen --forward-to localhost:4321/api/stripe/webhook`).

## Resend (email)

Set `RESEND_API_KEY` and `EMAIL_FROM`. Without Resend, verification emails are skipped in development (see `src/lib/email.ts`).

## S3 / media

Configure `S3_*` variables in `.env`. `POST /api/uploads/sign` returns a presigned PUT URL for admin uploads.

## Scripts

| Script            | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Astro dev server           |
| `npm run build`   | Production build (Vercel)  |
| `npm run check`   | `astro check`              |
| `npm run db:seed` | Run Prisma seed            |
| `npm run db:studio` | Prisma Studio            |

## Production readiness

**Ready:** Auth sessions, RBAC, CMS list/create (posts), blog + SEO surfaces, Stripe webhook skeleton, checkout redirects, forms + rate limits, search, sitemap/RSS/robots, admin dashboards.

**Harden next:** Email verification flows, password reset UI, rich text editor in admin, full cart checkout for multiple line items, CSRF tokens on cookie forms if needed, content sanitization pipeline for HTML bodies, monitoring, backups, and pen-test for file uploads.
