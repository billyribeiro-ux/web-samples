import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { getBrandName } from "@/lib/site";

export default async function HomePage() {
  const brand = await getBrandName();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: brand,
          url: base,
        }}
      />
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-28">
          <div className="max-w-xl space-y-6">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Premium digital business platform
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Launch faster. Convert better. Operate with confidence.
            </h1>
            <p className="text-lg text-muted-foreground">
              {brand} combines a conversion-focused marketing site, SEO blog,
              memberships, subscriptions, and ecommerce — with a real admin
              CMS backed by PostgreSQL.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/pricing">View pricing</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-md gap-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="text-sm font-medium">What you get</div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Headless CMS + RBAC admin</li>
              <li>Stripe subscriptions & checkout</li>
              <li>Blog & SEO primitives (metadata, sitemap, JSON-LD)</li>
              <li>Member portal, orders, and gated routes</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Marketing + SEO",
              body: "Semantic pages, structured data hooks, and editorial workflows built for growth teams.",
            },
            {
              title: "Commerce-ready",
              body: "Products, cart, checkout sessions, and order history wired to realistic Stripe flows.",
            },
            {
              title: "Operational admin",
              body: "Sortable tables, validation, media library patterns, and audit-friendly primitives.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
