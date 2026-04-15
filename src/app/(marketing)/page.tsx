import Link from "next/link";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <div>
      <OrganizationJsonLd />
      <section className="border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50 py-20 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Modern business platform
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Marketing, memberships, and commerce—built for real launches.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            SEO-first content, Clerk-powered accounts, Stripe subscriptions and checkout, and a real admin
            CMS—without the template mess.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/pricing"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              View pricing
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Read the blog
            </Link>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: "SEO & content",
              body: "Posts, categories, tags, sitemap, RSS, and structured data—first-class.",
            },
            {
              title: "Commerce & billing",
              body: "Products, cart, Checkout, subscriptions, and member gating.",
            },
            {
              title: "Admin that ships",
              body: "Manage content, catalog, orders, and leads in one place.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
