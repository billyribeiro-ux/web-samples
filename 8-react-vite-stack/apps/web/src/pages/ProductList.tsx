import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

type Product = {
  slug: string;
  title: string;
  description?: string | null;
  priceCents: number;
  currency: string;
};

export function ProductListPage() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    void (async () => {
      const data = await apiFetch<{ items: Product[] }>('/api/products');
      setItems(data.items);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Products — Acme Store</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Products</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map((p) => (
            <article key={p.slug} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">
                <Link to={`/products/${p.slug}`} className="no-underline hover:text-sky-800">
                  {p.title}
                </Link>
              </h2>
              {p.description && <p className="mt-2 text-sm text-slate-600">{p.description}</p>}
              <p className="mt-4 text-lg font-bold">
                ${(p.priceCents / 100).toFixed(2)} {p.currency.toUpperCase()}
              </p>
              <Link to={`/products/${p.slug}`} className="mt-4 inline-block text-sm font-semibold text-sky-700 no-underline">
                View details
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </>
  );
}
