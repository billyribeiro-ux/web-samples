import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return {};
  return { title: cat.name };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
  if (!cat) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{cat.name}</h1>
      <ul className="mt-8 space-y-4">
        {cat.posts.map((p) => (
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
