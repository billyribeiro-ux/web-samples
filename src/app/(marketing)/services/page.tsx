import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Services & products",
  description: "Explore offerings, digital products, and services.",
  path: "/services",
});

export default async function ServicesPage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { title: "asc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Services & products</h1>
      <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Browse our catalog. Checkout uses Stripe; inventory and fulfillment hooks are production-ready.
      </p>
      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={`/services/${p.slug}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-emerald-500/40 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{p.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>
              <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {(p.priceCents / 100).toLocaleString("en-US", { style: "currency", currency: p.currency })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {products.length === 0 && (
        <p className="mt-8 text-zinc-500">No products yet. Run the database seed script.</p>
      )}
    </div>
  );
}
