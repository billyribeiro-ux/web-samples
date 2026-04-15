import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { JsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { category: true },
  });
  if (!product) notFound();

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          offers: {
            "@type": "Offer",
            priceCurrency: product.currency.toUpperCase(),
            price: (product.priceCents / 100).toFixed(2),
            url: `${base}/products/${product.slug}`,
          },
        }}
      />
      <p className="text-sm text-muted-foreground">
        {product.category?.name ?? "Product"}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{product.name}</h1>
      <p className="mt-6 text-muted-foreground">{product.description}</p>
      <p className="mt-8 text-3xl font-semibold">
        ${(product.priceCents / 100).toFixed(2)}
      </p>
      <div className="mt-8">
        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
}
