import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

type Post = { slug: string; title: string; excerpt?: string | null };

export function TagPage() {
  const { slug } = useParams();
  const [name, setName] = useState('');
  const [items, setItems] = useState<Post[]>([]);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      const data = await apiFetch<{ tag: { name: string }; items: Post[] }>(`/api/tags/${slug}`);
      setName(data.tag.name);
      setItems(data.items);
    })();
  }, [slug]);

  return (
    <>
      <Helmet>
        <title>Tag: {name} — Acme Blog</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">#{name}</h1>
        <div className="mt-8 space-y-4">
          {items.map((p) => (
            <article key={p.slug} className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold">
                <Link to={`/blog/${p.slug}`} className="no-underline hover:text-sky-800">
                  {p.title}
                </Link>
              </h2>
              {p.excerpt && <p className="mt-1 text-sm text-slate-600">{p.excerpt}</p>}
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
