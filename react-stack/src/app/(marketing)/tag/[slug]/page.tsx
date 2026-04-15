import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return {};
  return { title: `#${tag.name}` };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        include: { post: true },
      },
    },
  });
  if (!tag) notFound();

  const posts = tag.posts
    .map((pt) => pt.post)
    .filter((p) => p.status === "PUBLISHED");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">#{tag.name}</h1>
      <ul className="mt-8 space-y-4">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/blog/${p.slug}`} className="font-medium hover:underline">
              {p.title}
            </Link>
            <p className="text-sm text-muted-foreground">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
