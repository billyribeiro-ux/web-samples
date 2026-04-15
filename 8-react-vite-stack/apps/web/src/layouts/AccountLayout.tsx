import { NavLink, Outlet } from 'react-router-dom';
import { Container } from '@/components/Container.js';

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium no-underline ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`;

export function AccountLayout() {
  return (
    <Container>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
          <nav className="mt-3 flex flex-col gap-1">
            <NavLink to="/account" end className={linkCls}>
              Overview
            </NavLink>
            <NavLink to="/account/profile" className={linkCls}>
              Profile
            </NavLink>
            <NavLink to="/account/subscription" className={linkCls}>
              Subscription
            </NavLink>
            <NavLink to="/account/orders" className={linkCls}>
              Orders
            </NavLink>
            <NavLink to="/account/favorites" className={linkCls}>
              Favorites
            </NavLink>
            <NavLink to="/members" className={linkCls}>
              Member library
            </NavLink>
          </nav>
        </aside>
        <section className="min-h-[320px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </section>
      </div>
    </Container>
  );
}
