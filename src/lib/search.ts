import { prisma } from "@/lib/db";

export type SearchResultType = "post" | "product" | "page";

export type UnifiedSearchHit = {
  type: SearchResultType;
  id: string;
  title: string;
  href: string;
  excerpt?: string | null;
};

/** PostgreSQL full-text search; swap implementation for Algolia/Meilisearch later. */
export async function searchSite(query: string, take = 20): Promise<UnifiedSearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const [posts, products, pages] = await Promise.all([
    prisma.$queryRaw<
      { id: string; title: string; slug: string; excerpt: string | null }[]
    >`
      SELECT p.id, p.title, p.slug, p.excerpt
      FROM "Post" p
      WHERE p.status = 'PUBLISHED'
        AND to_tsvector('english', coalesce(p."searchContent", '')) @@ plainto_tsquery('english', ${q})
      ORDER BY p."publishedAt" DESC NULLS LAST
      LIMIT ${take}
    `,
    prisma.$queryRaw<{ id: string; title: string; slug: string }[]>`
      SELECT pr.id, pr.title, pr.slug
      FROM "Product" pr
      WHERE pr.published = true
        AND to_tsvector('english', coalesce(pr."searchContent", '')) @@ plainto_tsquery('english', ${q})
      LIMIT ${take}
    `,
    prisma.$queryRaw<{ id: string; title: string; slug: string }[]>`
      SELECT pg.id, pg.title, pg.slug
      FROM "Page" pg
      WHERE pg.status = 'PUBLISHED'
        AND to_tsvector('english', coalesce(pg."searchContent", '')) @@ plainto_tsquery('english', ${q})
      LIMIT ${take}
    `,
  ]);

  const out: UnifiedSearchHit[] = [
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
      title: p.title,
      href: `/services/${p.slug}`,
      excerpt: null,
    })),
    ...pages.map((p) => ({
      type: "page" as const,
      id: p.id,
      title: p.title,
      href: `/${p.slug}`,
      excerpt: null,
    })),
  ];

  return out.slice(0, take);
}

export function buildSearchContent(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" \n ").slice(0, 50000);
}
