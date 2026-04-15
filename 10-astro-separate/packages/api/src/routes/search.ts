import { Hono } from "hono";
import { prisma } from "@repo/db";
import { rateLimitHit } from "../lib/rate-limit.js";
import { ApiError } from "../lib/errors.js";

export const searchRoutes = new Hono().get("/", async (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "unknown";
  const rl = await rateLimitHit(prisma, `search:${ip}`, { max: 60 });
  if (!rl.ok) throw new ApiError(429, "Too many requests", "RATE_LIMIT");

  const q = c.req.query("q")?.trim();
  if (!q) return c.json({ hits: [] });

  const hits = await prisma.$queryRaw<{ kind: string; id: string; title: string; slug: string; rank: number }[]>`
    SELECT * FROM (
      SELECT 'post' as kind, id, title, slug,
        ts_rank(to_tsvector('english', title || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body,'')),
          plainto_tsquery('english', ${q})) as rank
      FROM "Post"
      WHERE status = 'PUBLISHED'
        AND to_tsvector('english', title || ' ' || coalesce(excerpt,'') || ' ' || coalesce(body,''))
        @@ plainto_tsquery('english', ${q})
      UNION ALL
      SELECT 'product' as kind, id, name as title, slug,
        ts_rank(to_tsvector('english', name || ' ' || coalesce(description,'') || ' ' || coalesce(body,'')),
          plainto_tsquery('english', ${q})) as rank
      FROM "Product"
      WHERE status = 'ACTIVE'
        AND to_tsvector('english', name || ' ' || coalesce(description,'') || ' ' || coalesce(body,''))
        @@ plainto_tsquery('english', ${q})
      UNION ALL
      SELECT 'page' as kind, id, title, slug,
        ts_rank(to_tsvector('english', title || ' ' || coalesce(body,'')),
          plainto_tsquery('english', ${q})) as rank
      FROM "Page"
      WHERE status = 'PUBLISHED'
        AND to_tsvector('english', title || ' ' || coalesce(body,''))
        @@ plainto_tsquery('english', ${q})
    ) t
    ORDER BY rank DESC
    LIMIT 50
  `;

  return c.json({ hits });
});
