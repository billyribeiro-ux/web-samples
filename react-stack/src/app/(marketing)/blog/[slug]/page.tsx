import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { JsonLd } from "@/components/seo/json-ld";
import { sanitizeHtml } from "@/lib/sanitize";
import { auth } from "@/auth";
import { FavoritePostButton } from "@/components/blog/favorite-post-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) return {};
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: post.canonicalUrl ?? `${base}/blog/${post.slug}` },
    openGraph: {
      title: post.ogTitle ?? post.title,
      description: post.ogDescription ?? post.excerpt ?? undefined,
      type: "article",
      url: `${base}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      authorProfile: true,
      tags: { include: { tag: true } },
    },
  });
  if (!post) notFound();

  const session = await auth();
  let favorited = false;
  if (session?.user?.id) {
    const f = await prisma.userFavoritePost.findUnique({
      where: {
        userId_postId: { userId: session.user.id, postId: post.id },
      },
    });
    favorited = !!f;
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const related = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: post.categoryId ?? undefined,
      NOT: { id: post.id },
    },
    take: 3,
  });

  const html = sanitizeHtml(post.bodyHtml);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.publishedAt?.toISOString(),
          author: post.authorProfile
            ? {
                "@type": "Person",
                name: post.authorProfile.name,
                url: `${base}/author/${post.authorProfile.slug}`,
              }
            : undefined,
          mainEntityOfPage: `${base}/blog/${post.slug}`,
        }}
      />
      <p className="text-sm text-muted-foreground">
        {post.category ? (
          <Link href={`/category/${post.category.slug}`}>
            {post.category.name}
          </Link>
        ) : null}{" "}
        · {post.readingMinutes} min read
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{post.title}</h1>
      {post.authorProfile ? (
        <p className="mt-3 text-sm text-muted-foreground">
          By{" "}
          <Link
            href={`/author/${post.authorProfile.slug}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {post.authorProfile.name}
          </Link>
        </p>
      ) : null}
      {post.excerpt ? (
        <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
      ) : null}
      {session?.user ? (
        <div className="mt-6">
          <FavoritePostButton postId={post.id} initialFavorite={favorited} />
        </div>
      ) : null}
      <div
        className="mt-10 max-w-none space-y-4 leading-relaxed [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="mt-10 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <Link
            key={t.tagId}
            href={`/tag/${t.tag.slug}`}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            #{t.tag.name}
          </Link>
        ))}
      </div>
      {related.length ? (
        <section className="mt-16 border-t pt-10">
          <h2 className="text-lg font-semibold">Related</h2>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/blog/${r.slug}`} className="hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
