import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

export interface SearchHit {
  type: 'post' | 'page' | 'product';
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
}

/**
 * PostgreSQL full-text search with abstraction for swapping in Algolia/Meilisearch later.
 */
export async function searchAll(prisma: PrismaClient, rawQuery: string, limit = 15): Promise<SearchHit[]> {
  const q = rawQuery.trim().slice(0, 200);
  if (!q) return [];

  const rows = await prisma.$queryRaw<
    { type: string; id: string; slug: string; title: string; excerpt: string | null }[]
  >(
    Prisma.sql`
      SELECT * FROM (
        SELECT 'post'::text AS type, p.id, p.slug, p.title, p."excerpt" AS excerpt
        FROM "Post" p
        WHERE p.status = 'PUBLISHED'::"ContentStatus"
          AND (
            to_tsvector('english', p.title || ' ' || coalesce(p."excerpt", '') || ' ' || p.body)
            @@ websearch_to_tsquery('english', ${q})
          )
        UNION ALL
        SELECT 'page'::text, pg.id, pg.slug, pg.title, NULL::text
        FROM "Page" pg
        WHERE pg.status = 'PUBLISHED'::"ContentStatus"
          AND (
            to_tsvector('english', pg.title || ' ' || pg.body)
            @@ websearch_to_tsquery('english', ${q})
          )
        UNION ALL
        SELECT 'product'::text, pr.id, pr.slug, pr.title, pr.description
        FROM "Product" pr
        WHERE pr.status = 'ACTIVE'::"ProductStatus"
          AND (
            to_tsvector('english', pr.title || ' ' || coalesce(pr.description, '') || ' ' || coalesce(pr.body, ''))
            @@ websearch_to_tsquery('english', ${q})
          )
      ) hits
      LIMIT ${limit}
    `
  );

  return rows.map((r) => ({
    type: r.type as SearchHit['type'],
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
  }));
}
