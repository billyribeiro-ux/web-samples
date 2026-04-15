import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

type Post = {
  slug: string;
  title: string;
  excerpt?: string | null;
  readingMinutes: number;
  category?: { name: string; slug: string } | null;
};

export function BlogIndexPage() {
  const [items, setItems] = useState<Post[]>([]);

  useEffect(() => {
    void (async () => {
      const data = await apiFetch<{ items: Post[] }>('/api/posts?pageSize=20');
      setItems(data.items);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog — Acme Platform</title>
        <meta name="description" content="Articles on product, engineering, and growth." />
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Blog</h1>
        <div className="mt-8 space-y-6">
          {items.map((p) => (
            <article key={p.slug} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {p.category && (
                  <Link to={`/category/${p.category.slug}`} className="font-medium text-sky-700 no-underline">
                    {p.category.name}
                  </Link>
                )}
                <span>{p.readingMinutes} min read</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold">
                <Link to={`/blog/${p.slug}`} className="no-underline hover:text-sky-800">
                  {p.title}
                </Link>
              </h2>
              {p.excerpt && <p className="mt-2 text-slate-600">{p.excerpt}</p>}
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
