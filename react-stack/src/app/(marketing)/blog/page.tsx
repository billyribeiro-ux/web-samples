import type { Metadata } from "next";
import Link from "next/link";
import { prisma, withDbFallback } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles on product, growth, and implementation notes.",
};

export default async function BlogIndexPage() {
  const posts = await withDbFallback(
    () =>
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: { category: true, authorProfile: true },
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
      {!posts.length ? (
        <p className="mt-8 rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
          No published posts yet. With Postgres running, run{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            npx prisma migrate deploy
          </code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            npm run db:seed
          </code>{" "}
          to load demo content.
        </p>
      ) : null}
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {posts.map((p) => (
          <article key={p.id} className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase text-muted-foreground">
              {p.category?.name ?? "Article"} · {p.readingMinutes} min read
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              <Link href={`/blog/${p.slug}`} className="hover:underline">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {p.excerpt}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
