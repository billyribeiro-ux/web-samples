import { Router } from "express";
import { ContentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { Env } from "../config.js";

export function seoRouter(env: Env) {
  const r = Router();
  const base = env.APP_URL.replace(/\/$/, "");

  r.get("/sitemap.xml", async (_req, res) => {
    const [posts, pages, products] = await prisma.$transaction([
      prisma.post.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
      prisma.page.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
      prisma.product.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
    ]);
    const urls: { loc: string; lastmod: string }[] = [
      { loc: `${base}/`, lastmod: new Date().toISOString() },
      { loc: `${base}/about`, lastmod: new Date().toISOString() },
      { loc: `${base}/pricing`, lastmod: new Date().toISOString() },
      { loc: `${base}/blog`, lastmod: new Date().toISOString() },
    ];
    for (const p of posts) {
      urls.push({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt.toISOString() });
    }
    for (const p of pages) {
      urls.push({ loc: `${base}/${p.slug}`, lastmod: p.updatedAt.toISOString() });
    }
    for (const p of products) {
      urls.push({ loc: `${base}/services/${p.slug}`, lastmod: p.updatedAt.toISOString() });
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`,
  )
  .join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

  r.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nSitemap: ${base}/api/v1/seo/sitemap.xml\n`,
    );
  });

  return r;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
