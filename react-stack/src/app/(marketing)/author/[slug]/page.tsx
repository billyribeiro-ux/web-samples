import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await prisma.author.findUnique({ where: { slug } });
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio?.slice(0, 160) ?? `Articles by ${author.name}`,
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await prisma.author.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
  if (!author) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">{author.name}</h1>
      {author.bio ? (
        <p className="mt-4 text-muted-foreground">{author.bio}</p>
      ) : null}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">Articles</h2>
        <ul className="mt-6 space-y-4">
          {author.posts.map((p) => (
            <li key={p.id}>
              <Link href={`/blog/${p.slug}`} className="font-medium hover:underline">
                {p.title}
              </Link>
              {p.excerpt ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {p.excerpt}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        {!author.posts.length ? (
          <p className="text-sm text-muted-foreground">No published posts yet.</p>
        ) : null}
      </section>
    </div>
  );
}
