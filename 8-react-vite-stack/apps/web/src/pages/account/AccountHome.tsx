import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi.js';
import { useEffect, useState } from 'react';

export function AccountHomePage() {
  const api = useApi();
  const [email, setEmail] = useState('');

  useEffect(() => {
    void api<{ email: string }>('/api/me/profile').then((p) => setEmail(p.email));
  }, [api]);

  return (
    <>
      <Helmet>
        <title>Account — Acme</title>
      </Helmet>
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-slate-600">Signed in as {email}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/account/orders" className="rounded-lg border border-slate-200 p-4 no-underline hover:border-sky-300">
          <p className="text-sm font-semibold">Orders</p>
          <p className="text-xs text-slate-600">View receipts and fulfillment</p>
        </Link>
        <Link to="/members" className="rounded-lg border border-slate-200 p-4 no-underline hover:border-sky-300">
          <p className="text-sm font-semibold">Library</p>
          <p className="text-xs text-slate-600">Members-only resources</p>
        </Link>
      </div>
    </>
  );
}
