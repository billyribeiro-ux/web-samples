# Nuxt full-stack business platform

Production-minded Nuxt 4 app with Nitro APIs, Prisma + PostgreSQL, Lucia auth, Stripe (checkout, subscriptions, webhooks), Resend email, S3 presigned uploads, Tailwind CSS, VeeValidate + Zod, Postgres-backed search (replaceable with Algolia/Meilisearch), and PostHog/GA4-ready analytics hooks.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (local or Docker)

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start PostgreSQL (example with Docker):

   ```bash
   docker compose up -d
   ```

4. Apply migrations and seed demo data:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

   For local development without migration history, you can use:

   ```bash
   npx prisma db push
   npm run db:seed
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

### Demo accounts (after seed)

- **Admin:** `admin@example.com` / `Password123!`
- **Member:** `member@example.com` / `Password123!`

## Key routes

- Public marketing, blog, products, cart, checkout
- Auth: `/login`, `/register`, `/verify-email`, password reset
- Account: `/account/*`
- Members (gated): `/members` (also `/library` → redirect)
- Admin CMS: `/admin/*`
- SEO: `/sitemap.xml`, `/robots.txt`, `/feed.xml`

## Production readiness

**Ready:** SSR pages, RBAC, Lucia sessions, Prisma schema, Stripe wiring (requires real keys), webhook route, forms with rate limits, admin list views for posts/orders/leads, search abstraction.

**Harden next:** Legal copy, email deliverability, Stripe price IDs on `Plan` rows, S3 CORS and bucket policy, Redis-backed rate limits, HTML sanitization for rich CMS HTML, full admin create/edit forms, automated tests, security review.

## Deploy

Build with `npm run build` and run `node .output/server/index.mjs`, or deploy to Vercel/Netlify/Node with `DATABASE_URL` and secrets configured. Set `NUXT_PUBLIC_SITE_URL` to the production URL for canonical links and Stripe redirects.

### Stripe webhooks

Point Stripe to `POST /api/webhooks/stripe` with your signing secret in `STRIPE_WEBHOOK_SECRET`. If signature verification fails behind a proxy, ensure the raw request body is passed through (some hosts require disabling JSON body parsing for that path).
