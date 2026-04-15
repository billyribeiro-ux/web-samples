import type { Metadata } from "next";
import Link from "next/link";
import { prisma, withDbFallback } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Products",
  description: "Digital goods and services with Stripe Checkout.",
};

export default async function ProductsPage() {
  const products = await withDbFallback(
    () =>
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { name: "asc" },
        include: { category: true },
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Products</h1>
      {!products.length ? (
        <p className="mt-8 rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
          No products yet. Run{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            npm run db:seed
          </code>{" "}
          after migrations, or add products in the admin area.
        </p>
      ) : null}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-xl border bg-card p-6 shadow-sm"
          >
            <p className="text-xs uppercase text-muted-foreground">
              {p.category?.name ?? "Product"}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{p.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {p.description}
            </p>
            <p className="mt-4 text-2xl font-semibold">
              ${(p.priceCents / 100).toFixed(2)}
            </p>
            <Button asChild className="mt-6">
              <Link href={`/products/${p.slug}`}>View</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
