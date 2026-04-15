import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useApi } from '@/hooks/useApi.js';

type Order = { id: string; status: string; totalCents: number; currency: string; createdAt: string };

export function OrdersPage() {
  const api = useApi();
  const [items, setItems] = useState<Order[]>([]);

  useEffect(() => {
    void api<{ items: Order[] }>('/api/me/orders').then((d) => setItems(d.items));
  }, [api]);

  return (
    <>
      <Helmet>
        <title>Orders — Acme</title>
      </Helmet>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <ul className="mt-4 space-y-3">
        {items.map((o) => (
          <li key={o.id} className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold">
              {o.status} · ${(o.totalCents / 100).toFixed(2)} {o.currency.toUpperCase()}
            </p>
            <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
          </li>
        ))}
        {items.length === 0 && <p className="text-slate-600">No orders yet.</p>}
      </ul>
    </>
  );
}
