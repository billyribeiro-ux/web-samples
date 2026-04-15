import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Tag" };
  return buildPageMetadata({
    title: `Tag: ${tag.name}`,
    description: `Content tagged ${tag.name}`,
    path: `/tag/${slug}`,
  });
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { post: { status: "PUBLISHED" } },
        include: {
          post: {
            include: { author: true },
          },
        },
      },
    },
  });
  if (!tag) notFound();

  const posts = tag.posts.map((pt) => pt.post);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">#{tag.name}</h1>
      <ul className="mt-12 space-y-8">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`} className="text-xl font-semibold text-zinc-900 hover:text-emerald-700 dark:text-zinc-50 dark:hover:text-emerald-400">
              {post.title}
            </Link>
            {post.excerpt && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
