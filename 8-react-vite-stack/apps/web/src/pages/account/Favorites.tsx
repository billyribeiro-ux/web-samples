import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApi } from '@/hooks/useApi.js';

type Fav = { product: { slug: string; title: string } };

export function FavoritesPage() {
  const api = useApi();
  const [items, setItems] = useState<Fav[]>([]);

  useEffect(() => {
    void api<{ items: Fav[] }>('/api/me/favorites').then((d) => setItems(d.items));
  }, [api]);

  return (
    <>
      <Helmet>
        <title>Favorites — Acme</title>
      </Helmet>
      <h1 className="text-2xl font-semibold">Favorites</h1>
      <ul className="mt-4 space-y-2">
        {items.map((f) => (
          <li key={f.product.slug}>
            <Link to={`/products/${f.product.slug}`} className="text-sky-800 no-underline">
              {f.product.title}
            </Link>
          </li>
        ))}
        {items.length === 0 && <p className="text-slate-600">No favorites yet.</p>}
      </ul>
    </>
  );
}
