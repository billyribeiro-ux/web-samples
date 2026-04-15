# Business Platform (Next.js)

Production-minded starter: marketing site, SEO blog, memberships, Stripe commerce and subscriptions, custom `/admin` CMS (Prisma + RBAC), Auth.js credentials, Resend email hooks, S3-ready uploads, PostHog-ready analytics, and Postgres full-text style search.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (local Docker or hosted)

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and set at minimum:

   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — long random string (32+ chars)
   - `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

   Optional integrations:

   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY`, `EMAIL_FROM`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
   - `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`

3. **Database**

   Start Postgres (example):

   ```bash
   docker compose up -d
   ```

   Apply schema:

   ```bash
   npx prisma migrate deploy
   # or during development:
   npx prisma db push
   ```

4. **Seed demo data**

   ```bash
   npm run db:seed
   ```

   Seeded logins:

   - **Admin:** `admin@example.com` / `password`
   - **Member:** `member@example.com` / `password`

5. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### If you see `User postgres was denied access on the database ... public`

That comes from PostgreSQL (permissions or wrong connection), not from React. Typical fixes:

1. **Confirm `DATABASE_URL`** matches a running server: host, port `5432`, database name `business_platform`, user/password (see `docker-compose.yml` for the local defaults).
2. **Create DB and schema** if needed: `npx prisma db push` or `migrate deploy` against the same URL.
3. **PostgreSQL 15+** sometimes restricts `public`. Connect as a superuser and run:

   ```sql
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO PUBLIC;
   ```

4. **Another Postgres on port 5432** — you might be hitting a different instance than Docker. Stop the other service or change the mapped port in `docker-compose.yml`.

Marketing header/footer use safe fallbacks if the DB is down so the shell still loads; other routes still need a working database.

## Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the signing secret as `STRIPE_WEBHOOK_SECRET`.

## Production (Vercel)

- Set all environment variables in the Vercel project.
- Use a managed PostgreSQL (Neon, Supabase, RDS, etc.).
- Point `NEXT_PUBLIC_APP_URL` at the production domain.
- Configure Stripe live keys and webhook endpoint URL for `/api/webhooks/stripe`.
- Configure S3 (or compatible) CORS for uploads if using `/api/upload`.

## What is production-ready vs scaffolded

- **Ready:** Auth flows (register, login, reset token storage), RBAC model, admin post editor with sanitization, cart + Checkout Session metadata, webhook idempotency for duplicate sessions, rate-limited public forms, SEO metadata helpers, sitemap/robots/RSS, member gate rules.
- **Harden next:** Email verification end-to-end, richer CMS block editor, inventory reservations, full audit UI, advanced discounts, Algolia swap in `src/lib/search.ts`, production rate limits (e.g. Redis).

## Recent capabilities

- **Author pages** at `/author/[slug]` (linked from blog bylines).
- **Mobile navigation** (header menu button on small screens).
- **Account → Security** for password changes (credential accounts).
- **Stripe subscription checkout** via `POST /api/billing/subscribe` (month/year); webhook creates `Subscription` rows for `checkout.session.completed` with `mode: subscription`.
- **Save article** on blog posts when signed in (favorites).

## Scripts

| Script            | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Next.js dev (Turbopack)    |
| `npm run build`   | `prisma generate` + build  |
| `npm run db:seed` | Run `prisma/seed.ts`       |
| `npm run db:studio` | Prisma Studio            |
