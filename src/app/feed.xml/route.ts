import { prisma } from "@/lib/db";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { author: true },
  });

  const items = posts
    .map((p) => {
      const pub = p.publishedAt?.toUTCString() ?? new Date().toUTCString();
      const link = `${base}/blog/${p.slug}`;
      return `
  <item>
    <title><![CDATA[${p.title}]]></title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${pub}</pubDate>
    <description><![CDATA[${p.excerpt ?? ""}]]></description>
    <author>${p.author.name}</author>
  </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Platform Blog</title>
    <link>${base}/blog</link>
    <description>Latest articles</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

export const dynamic = "force-dynamic";
