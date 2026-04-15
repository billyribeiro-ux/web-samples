import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";
import { AddToCartButton } from "@/components/commerce/add-to-cart-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Not found" };
  return buildPageMetadata({
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.description.slice(0, 160),
    path: `/services/${product.slug}`,
    ogImage: product.featuredImageUrl ?? undefined,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, published: true },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/services" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        ← All products
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          {product.featuredImageUrl ? (
            <Image src={product.featuredImageUrl} alt={product.title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">No image</div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{product.title}</h1>
          <p className="mt-4 text-2xl font-medium text-zinc-900 dark:text-zinc-50">
            {(product.priceCents / 100).toLocaleString("en-US", { style: "currency", currency: product.currency })}
          </p>
          {product.category && (
            <p className="mt-2 text-sm text-zinc-500">
              Category:{" "}
              <Link href={`/services?category=${product.category.slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                {product.category.name}
              </Link>
            </p>
          )}
          <div className="mt-8">
            <AddToCartButton productId={product.id} />
          </div>
          <div className="mt-10 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{product.description}</div>
          {product.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {product.tags.map((pt) => (
                <li key={pt.tagId}>
                  <Link
                    href={`/tag/${pt.tag.slug}`}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {pt.tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
