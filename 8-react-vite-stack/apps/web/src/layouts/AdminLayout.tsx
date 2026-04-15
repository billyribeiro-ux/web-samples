import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useApi } from '@/hooks/useApi.js';

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm no-underline ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`;

export function AdminLayout() {
  const api = useApi();
  const [state, setState] = useState<'loading' | 'ok' | 'deny'>('loading');

  useEffect(() => {
    void (async () => {
      try {
        const p = await api<{ role: string }>('/api/me/profile');
        setState(['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(p.role) ? 'ok' : 'deny');
      } catch {
        setState('deny');
      }
    })();
  }, [api]);

  if (state === 'loading') return <p className="px-6 py-10 text-slate-600">Checking access…</p>;
  if (state === 'deny') return <Navigate to="/account" replace />;

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <aside className="w-56 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
        <nav className="mt-3 flex flex-col gap-1">
          <NavLink to="/admin" end className={linkCls}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/posts" className={linkCls}>
            Posts
          </NavLink>
          <NavLink to="/admin/pages" className={linkCls}>
            Pages
          </NavLink>
          <NavLink to="/admin/products" className={linkCls}>
            Products
          </NavLink>
          <NavLink to="/admin/orders" className={linkCls}>
            Orders
          </NavLink>
          <NavLink to="/admin/forms" className={linkCls}>
            Leads
          </NavLink>
          <NavLink to="/admin/users" className={linkCls}>
            Users
          </NavLink>
          <NavLink to="/admin/settings" className={linkCls}>
            Settings
          </NavLink>
        </nav>
      </aside>
      <section className="min-h-[480px] flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Outlet />
      </section>
    </div>
  );
}
