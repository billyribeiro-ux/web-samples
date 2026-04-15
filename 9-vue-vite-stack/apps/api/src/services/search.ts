import { prisma } from "../lib/prisma.js";

export type SearchResultType = "post" | "page" | "product";

export type SearchHit = {
  type: SearchResultType;
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
};

/**
 * PostgreSQL full-text search using `plainto_tsquery` / `to_tsvector`.
 * Abstracted so an Algolia/Meilisearch provider can mirror this interface later.
 */
export async function searchAll(q: string, limit = 20): Promise<SearchHit[]> {
  const query = q.trim();
  if (!query) return [];

  const rows = await prisma.$queryRaw<
    { type: string; id: string; title: string; slug: string; excerpt: string | null }[]
  >`
    SELECT * FROM (
      SELECT 'post'::text AS type, p.id::text, p.title, p.slug, p.excerpt
      FROM "Post" p
      WHERE p.status = 'PUBLISHED'
        AND to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.excerpt,'') || ' ' || coalesce(p.content,''))
            @@ plainto_tsquery('english', ${query})
      UNION ALL
      SELECT 'page'::text, pg.id::text, pg.title, pg.slug, NULL::text
      FROM "Page" pg
      WHERE pg.published = true
        AND to_tsvector('english', coalesce(pg.title,'') || ' ' || coalesce(pg.content,''))
            @@ plainto_tsquery('english', ${query})
      UNION ALL
      SELECT 'product'::text, pr.id::text, pr.name, pr.slug, NULL::text
      FROM "Product" pr
      WHERE pr.published = true
        AND to_tsvector('english', coalesce(pr.name,'') || ' ' || coalesce(pr.description,''))
            @@ plainto_tsquery('english', ${query})
    ) s
    LIMIT ${limit}
  `;

  return rows.map((r: { type: string; id: string; title: string; slug: string; excerpt: string | null }) => ({
    type: r.type as SearchResultType,
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
  }));
}
