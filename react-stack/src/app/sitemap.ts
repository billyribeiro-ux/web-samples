import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [posts, products, pages, authors] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.page.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.author.findMany({
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/pricing",
    "/blog",
    "/contact",
    "/faq",
    "/search",
    "/products",
    "/privacy-policy",
    "/terms",
    "/cookies",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const blogUrls = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const productUrls = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  const pageUrls = pages
    .filter((p) => p.slug !== "home")
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt,
    }));

  const authorUrls = authors.map((a) => ({
    url: `${base}/author/${a.slug}`,
    lastModified: a.updatedAt,
  }));

  return [
    ...staticRoutes,
    ...blogUrls,
    ...productUrls,
    ...pageUrls,
    ...authorUrls,
  ];
}
