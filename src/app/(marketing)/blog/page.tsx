import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Blog",
  description: "Articles on product, engineering, and growth.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { author: true, category: true },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Blog</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Long-form content with SEO metadata, structured data, and RSS.
      </p>
      <ul className="mt-12 space-y-10">
        {posts.map((post) => (
          <li key={post.id}>
            <article>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : ""}{" "}
                · {post.readingMinutes} min read
                {post.category && (
                  <>
                    {" "}
                    ·{" "}
                    <Link href={`/category/${post.category.slug}`} className="hover:underline">
                      {post.category.name}
                    </Link>
                  </>
                )}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700 dark:hover:text-emerald-400">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>}
            </article>
          </li>
        ))}
      </ul>
      {posts.length === 0 && <p className="mt-8 text-zinc-500">No posts yet. Run the seed script.</p>}
    </div>
  );
}
