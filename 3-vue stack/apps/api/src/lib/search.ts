import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type SearchResultType = "post" | "page" | "product";

export interface SearchHit {
  type: SearchResultType;
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  rank: number;
}

/** Postgres full-text search; swap implementation for Algolia/Meilisearch later. */
export async function searchPostgres(prisma: PrismaClient, query: string, limit = 20): Promise<SearchHit[]> {
  const term = query.trim();
  if (!term) return [];

  const rows = await prisma.$queryRaw<
    {
      type: string;
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      rank: number;
    }[]
  >(Prisma.sql`
    (
      SELECT 'post'::text AS type, p.id, p.title, p.slug, p.excerpt,
        ts_rank(
          to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.body,'')),
          plainto_tsquery('english', ${term})
        ) AS rank
      FROM "Post" p
      WHERE p.status = 'PUBLISHED'
        AND to_tsvector('english', coalesce(p.title,'') || ' ' || coalesce(p.body,''))
            @@ plainto_tsquery('english', ${term})
    )
    UNION ALL
    (
      SELECT 'page'::text, pg.id, pg.title, pg.slug, NULL::text,
        ts_rank(
          to_tsvector('english', coalesce(pg.title,'') || ' ' || coalesce(pg.body,'')),
          plainto_tsquery('english', ${term})
        )
      FROM "Page" pg
      WHERE pg.status = 'PUBLISHED'
        AND to_tsvector('english', coalesce(pg.title,'') || ' ' || coalesce(pg.body,''))
            @@ plainto_tsquery('english', ${term})
    )
    UNION ALL
    (
      SELECT 'product'::text, pr.id, pr.name, pr.slug, LEFT(pr.description, 200),
        ts_rank(
          to_tsvector('english', coalesce(pr.name,'') || ' ' || coalesce(pr.description,'')),
          plainto_tsquery('english', ${term})
        )
      FROM "Product" pr
      WHERE pr.status = 'PUBLISHED'
        AND to_tsvector('english', coalesce(pr.name,'') || ' ' || coalesce(pr.description,''))
            @@ plainto_tsquery('english', ${term})
    )
    ORDER BY rank DESC
    LIMIT ${limit}
  `);

  return rows.map((r) => ({
    type: r.type as SearchResultType,
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    rank: Number(r.rank),
  }));
}
