import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useApi } from '@/hooks/useApi.js';

type Dash = { posts: number; pages: number; products: number; orders: number; submissions: number; users: number };

export function AdminDashboardPage() {
  const api = useApi();
  const [dash, setDash] = useState<Dash | null>(null);

  useEffect(() => {
    void api<Dash>('/api/admin/dashboard').then(setDash);
  }, [api]);

  return (
    <>
      <Helmet>
        <title>Admin — Dashboard</title>
      </Helmet>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {!dash && <p className="mt-4 text-slate-600">Loading…</p>}
      {dash && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ['Posts', dash.posts],
              ['Pages', dash.pages],
              ['Products', dash.products],
              ['Orders', dash.orders],
              ['Submissions', dash.submissions],
              ['Users', dash.users],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
