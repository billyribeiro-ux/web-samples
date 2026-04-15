import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AuthSignedIn, AuthSignedOut, AuthUserButton } from '@/auth/AuthWidgets.js';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';
import { track } from '@/lib/analytics.js';

type NavItem = { label: string; href: string };

export function PublicLayout() {
  const location = useLocation();
  const [header, setHeader] = useState<NavItem[]>([]);
  const [footer, setFooter] = useState<NavItem[]>([]);
  const [siteName, setSiteName] = useState('Acme');

  useEffect(() => {
    track('page_view', { path: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<{ site: { name?: string }; navigation: { header: NavItem[]; footer: NavItem[] } }>(
          '/api/site'
        );
        setHeader(data.navigation.header ?? []);
        setFooter(data.navigation.footer ?? []);
        if (typeof data.site === 'object' && data.site && 'name' in data.site) {
          setSiteName(String((data.site as { name?: string }).name ?? 'Acme'));
        }
      } catch {
        setHeader([
          { label: 'About', href: '/about' },
          { label: 'Services', href: '/services' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/contact' },
        ]);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="text-lg font-semibold tracking-tight no-underline">
              {siteName}
            </Link>
            <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
              {header.map((item) => (
                <Link key={item.href} to={item.href} className="text-sm text-slate-700 no-underline hover:text-sky-700">
                  {item.label}
                </Link>
              ))}
              <Link to="/search" className="text-sm text-slate-700 no-underline hover:text-sky-700">
                Search
              </Link>
              <Link to="/cart" className="text-sm text-slate-700 no-underline hover:text-sky-700">
                Cart
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <AuthSignedOut>
                <Link
                  to="/login"
                  className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white no-underline hover:bg-slate-800"
                >
                  Log in
                </Link>
              </AuthSignedOut>
              <AuthSignedIn>
                <Link to="/account" className="text-sm text-slate-700 no-underline">
                  Account
                </Link>
                <AuthUserButton />
              </AuthSignedIn>
            </div>
          </div>
        </Container>
      </header>
      <main id="main" className="flex-1 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-10">
        <Container>
          <div className="flex flex-wrap gap-6 text-sm text-slate-600">
            {footer.map((item) => (
              <Link key={item.href} to={item.href} className="no-underline hover:text-sky-700">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} {siteName}</p>
        </Container>
      </footer>
    </div>
  );
}
