import { Router } from "express";
import { paramStr } from "../lib/params.js";
import { prisma } from "../lib/prisma.js";

export const seoRouter = Router();

seoRouter.get("/sitemap.xml", async (req, res, next) => {
  try {
    const base = req.env.WEB_ORIGIN;
    const [posts, pages, products] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.page.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.product.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const staticPaths = [
      "",
      "/about",
      "/services",
      "/pricing",
      "/blog",
      "/search",
      "/contact",
      "/faq",
      "/privacy-policy",
      "/terms",
      "/cookies",
      "/cart",
    ];

    const urls: { loc: string; lastmod: string }[] = staticPaths.map((p) => ({
      loc: `${base}${p}`,
      lastmod: new Date().toISOString(),
    }));

    for (const p of posts) {
      urls.push({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt.toISOString() });
    }
    for (const p of pages) {
      urls.push({ loc: `${base}/${p.slug === "home" ? "" : p.slug}`, lastmod: p.updatedAt.toISOString() });
    }
    for (const pr of products) {
      urls.push({ loc: `${base}/services/${pr.slug}`, lastmod: pr.updatedAt.toISOString() });
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod></url>`
  )
  .join("\n")}
</urlset>`;

    res.type("application/xml").send(body);
  } catch (e) {
    next(e);
  }
});

seoRouter.get("/robots.txt", (req, res) => {
  const base = req.env.WEB_ORIGIN;
  res.type("text/plain").send(`User-agent: *
Allow: /

Sitemap: ${base}/api/v1/seo/sitemap.xml
`);
});

seoRouter.get("/og/:type/:slug", async (req, res, next) => {
  try {
    const type = paramStr(req.params.type);
    const slug = paramStr(req.params.slug);
    const base = req.env.WEB_ORIGIN;
    let title = "Platform";
    let description = "";
    if (type === "post") {
      const post = await prisma.post.findFirst({
        where: { slug, status: "PUBLISHED" },
      });
      if (post) {
        title = post.seoTitle ?? post.title;
        description = post.seoDescription ?? post.excerpt ?? "";
      }
    }
    const html = `<!doctype html><html><head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<meta property="og:title" content="${escapeHtml(title)}"/>
<meta property="og:description" content="${escapeHtml(description)}"/>
<meta property="og:type" content="article"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta http-equiv="refresh" content="0;url=${escapeHtml(`${base}/blog/${slug}`)}"/>
</head><body><a href="${escapeHtml(`${base}/blog/${slug}`)}">Continue</a></body></html>`;
    res.type("html").send(html);
  } catch (e) {
    next(e);
  }
});

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
