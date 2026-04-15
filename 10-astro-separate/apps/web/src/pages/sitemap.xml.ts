import type { APIRoute } from "astro";
import { apiServerFetch } from "../lib/api";

export const GET: APIRoute = async ({ request }) => {
  const site = import.meta.env.PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const urls = new Set<string>();

  const staticPaths = [
    "/",
    "/about",
    "/services",
    "/pricing",
    "/blog",
    "/contact",
    "/faq",
    "/search",
    "/cart",
    "/checkout",
    "/thank-you",
    "/login",
    "/register",
    "/privacy-policy",
    "/terms",
    "/cookies",
  ];
  staticPaths.forEach((p) => urls.add(p));

  const posts = await apiServerFetch(request, "/v1/public/posts?take=200");
  if (posts.ok) {
    const j = (await posts.json()) as { posts: { slug: string }[] };
    j.posts.forEach((p) => urls.add(`/blog/${p.slug}`));
  }

  const products = await apiServerFetch(request, "/v1/public/products");
  if (products.ok) {
    const j = (await products.json()) as { products: { slug: string }[] };
    j.products.forEach((p) => urls.add(`/products/${p.slug}`));
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    [...urls]
      .map(
        (loc) =>
          `<url><loc>${site.replace(/\/$/, "")}${loc}</loc><changefreq>weekly</changefreq></url>`
      )
      .join("") +
    `</urlset>`;

  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
