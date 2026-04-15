import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

type Hit = { type: 'post' | 'page' | 'product'; slug: string; title: string; excerpt?: string | null };

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    if (!q) {
      setHits([]);
      return;
    }
    void (async () => {
      const data = await apiFetch<{ hits: Hit[] }>(`/api/search?q=${encodeURIComponent(q)}`);
      setHits(data.hits);
    })();
  }, [q]);

  return (
    <>
      <Helmet>
        <title>Search{q ? `: ${q}` : ''} — Acme</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Search</h1>
        {!q && <p className="mt-3 text-slate-600">Enter a query in the URL, e.g. /search?q=pricing</p>}
        {q && (
          <ul className="mt-8 space-y-4">
            {hits.map((h) => (
              <li key={`${h.type}-${h.slug}`} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase text-slate-500">{h.type}</p>
                <Link
                  to={h.type === 'post' ? `/blog/${h.slug}` : h.type === 'product' ? `/products/${h.slug}` : `/${h.slug}`}
                  className="text-lg font-semibold text-sky-800 no-underline"
                >
                  {h.title}
                </Link>
                {h.excerpt && <p className="mt-1 text-sm text-slate-600">{h.excerpt}</p>}
              </li>
            ))}
            {hits.length === 0 && <p className="text-slate-600">No results.</p>}
          </ul>
        )}
      </Container>
    </>
  );
}
