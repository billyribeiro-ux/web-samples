import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";
import { ProseHtml } from "@/components/content/prose-html";
import { ArticleJsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") return { title: "Not found" };
  return buildPageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    path: `/blog/${post.slug}`,
    ogImage: post.ogImageUrl ?? post.featuredImageUrl ?? undefined,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { author: true, category: true, tags: { include: { tag: true } } },
  });
  if (!post) notFound();

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/blog/${post.slug}`;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        url={url}
        datePublished={post.publishedAt?.toISOString() ?? null}
        dateModified={post.updatedAt.toISOString()}
        authorName={post.author.name}
        imageUrl={post.featuredImageUrl ?? post.ogImageUrl}
      />
      <p className="text-sm text-zinc-500">
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        {post.category && (
          <>
            {" "}
            /{" "}
            <Link href={`/category/${post.category.slug}`} className="hover:underline">
              {post.category.name}
            </Link>
          </>
        )}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{post.title}</h1>
      <p className="mt-4 text-sm text-zinc-500">
        By {post.author.name} · {post.readingMinutes} min read
      </p>
      {post.featuredImageUrl && (
        <div className="relative mt-10 aspect-[2/1] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          <Image src={post.featuredImageUrl} alt="" fill className="object-cover" priority sizes="(max-width:768px) 100vw, 768px" />
        </div>
      )}
      <ProseHtml html={post.bodyHtml} className="mt-10" />
      {post.tags.length > 0 && (
        <ul className="mt-12 flex flex-wrap gap-2 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          {post.tags.map((t) => (
            <li key={t.tagId}>
              <Link
                href={`/tag/${t.tag.slug}`}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {t.tag.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
