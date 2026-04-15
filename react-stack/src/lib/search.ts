import { prisma } from "@/lib/db";

export type SearchResult =
  | { type: "post"; id: string; title: string; href: string; excerpt?: string | null }
  | { type: "product"; id: string; title: string; href: string; excerpt?: string | null }
  | { type: "page"; id: string; title: string; href: string; excerpt?: string | null }
  | { type: "author"; id: string; title: string; href: string; excerpt?: string | null };

export async function siteSearch(q: string, take = 20): Promise<SearchResult[]> {
  const term = q.trim();
  if (!term) return [];

  const [posts, products, pages, authors] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { excerpt: { contains: term, mode: "insensitive" } },
        ],
      },
      take,
      select: { id: true, slug: true, title: true, excerpt: true },
    }),
    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
        ],
      },
      take,
      select: { id: true, slug: true, name: true, description: true },
    }),
    prisma.page.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { excerpt: { contains: term, mode: "insensitive" } },
        ],
      },
      take,
      select: { id: true, slug: true, title: true, excerpt: true },
    }),
    prisma.author.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { bio: { contains: term, mode: "insensitive" } },
        ],
      },
      take,
      select: { id: true, slug: true, name: true, bio: true },
    }),
  ]);

  const out: SearchResult[] = [
    ...posts.map((p) => ({
      type: "post" as const,
      id: p.id,
      title: p.title,
      href: `/blog/${p.slug}`,
      excerpt: p.excerpt,
    })),
    ...products.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      href: `/products/${p.slug}`,
      excerpt: p.description.slice(0, 160),
    })),
    ...pages.map((p) => ({
      type: "page" as const,
      id: p.id,
      title: p.title,
      href: `/${p.slug === "home" ? "" : p.slug}`,
      excerpt: p.excerpt,
    })),
    ...authors.map((a) => ({
      type: "author" as const,
      id: a.id,
      title: a.name,
      href: `/author/${a.slug}`,
      excerpt: a.bio?.slice(0, 160) ?? null,
    })),
  ];

  return out.slice(0, take);
}
