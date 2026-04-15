import type { APIRoute } from "astro";

export const GET: APIRoute = ({ request }) => {
  const site = import.meta.env.PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const body = `User-agent: *\nAllow: /\nSitemap: ${site.replace(/\/$/, "")}/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
