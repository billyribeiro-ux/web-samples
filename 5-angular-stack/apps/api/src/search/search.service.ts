import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SearchHit, SearchPort } from './search.port';

export type { SearchHit } from './search.port';

type RawHit = {
  type: string;
  id: string;
  title: string;
  excerpt: string | null;
  path: string;
};

@Injectable()
export class SearchService implements SearchPort {
  private readonly log = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(q: string, limit = 20): Promise<SearchHit[]> {
    const term = q.trim();
    if (!term) return [];
    const take = Math.min(Math.max(limit, 1), 100);

    try {
      return await this.searchWithPostgresFts(term, take);
    } catch (e) {
      this.log.warn(`FTS search failed, falling back to ILIKE: ${e}`);
      return this.searchFallbackIlike(term, take);
    }
  }

  /** Uses plainto_tsquery + ts_rank_cd across Post, Product, Page (published only). */
  private async searchWithPostgresFts(term: string, take: number): Promise<SearchHit[]> {
    const rows = await this.prisma.$queryRaw<RawHit[]>(
      Prisma.sql`
      WITH q AS (SELECT plainto_tsquery('english', ${term}) AS tsq)
      SELECT * FROM (
        SELECT
          'post'::text AS type,
          p.id::text AS id,
          p.title,
          LEFT(p.body, 280) AS excerpt,
          '/blog/' || p.slug AS path,
          ts_rank_cd(
            setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(p.excerpt, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(p.body, '')), 'C'),
            (SELECT tsq FROM q)
          ) AS rank
        FROM "Post" p, q
        WHERE p.status = 'PUBLISHED'
          AND (
            setweight(to_tsvector('english', coalesce(p.title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(p.excerpt, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(p.body, '')), 'C')
          ) @@ (SELECT tsq FROM q)
        UNION ALL
        SELECT
          'product'::text,
          pr.id::text,
          pr.name,
          LEFT(coalesce(pr.description, pr.body, ''), 280),
          '/products/' || pr.slug,
          ts_rank_cd(
            to_tsvector('english', coalesce(pr.name, '') || ' ' || coalesce(pr.description, '') || ' ' || coalesce(pr.body, '')),
            (SELECT tsq FROM q)
          )
        FROM "Product" pr, q
        WHERE pr.status = 'PUBLISHED'
          AND to_tsvector('english', coalesce(pr.name, '') || ' ' || coalesce(pr.description, '') || ' ' || coalesce(pr.body, '')) @@ (SELECT tsq FROM q)
        UNION ALL
        SELECT
          'page'::text,
          pg.id::text,
          pg.title,
          LEFT(pg.body, 280),
          '/' || pg.slug,
          ts_rank_cd(
            to_tsvector('english', coalesce(pg.title, '') || ' ' || coalesce(pg.body, '')),
            (SELECT tsq FROM q)
          )
        FROM "Page" pg, q
        WHERE pg.status = 'PUBLISHED'
          AND to_tsvector('english', coalesce(pg.title, '') || ' ' || coalesce(pg.body, '')) @@ (SELECT tsq FROM q)
      ) r
      ORDER BY rank DESC
      LIMIT ${take}
    `,
    );

    return rows.map((r) => ({
      type: r.type as SearchHit['type'],
      id: r.id,
      title: r.title,
      excerpt: r.excerpt,
      path: r.path,
    }));
  }

  private async searchFallbackIlike(term: string, take: number): Promise<SearchHit[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { excerpt: { contains: term, mode: 'insensitive' } },
        ],
      },
      take,
      select: { id: true, title: true, excerpt: true, slug: true },
    });
    const products = await this.prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      },
      take,
      select: { id: true, name: true, description: true, slug: true },
    });
    const pages = await this.prisma.page.findMany({
      where: {
        status: 'PUBLISHED',
        title: { contains: term, mode: 'insensitive' },
      },
      take,
      select: { id: true, title: true, slug: true },
    });

    const hits: SearchHit[] = [
      ...posts.map((p) => ({
        type: 'post' as const,
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        path: `/blog/${p.slug}`,
      })),
      ...products.map((p) => ({
        type: 'product' as const,
        id: p.id,
        title: p.name,
        excerpt: p.description,
        path: `/products/${p.slug}`,
      })),
      ...pages.map((p) => ({
        type: 'page' as const,
        id: p.id,
        title: p.title,
        excerpt: null,
        path: `/${p.slug}`,
      })),
    ];
    return hits.slice(0, take);
  }
}
