import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Category" };
  return buildPageMetadata({
    title: `Category: ${cat.name}`,
    description: cat.description ?? `Posts in ${cat.name}`,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: { author: true },
      },
    },
  });
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{category.name}</h1>
      {category.description && <p className="mt-4 text-zinc-600 dark:text-zinc-400">{category.description}</p>}
      <ul className="mt-12 space-y-8">
        {category.posts.map((post) => (
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
