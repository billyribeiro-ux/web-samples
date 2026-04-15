import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthSignedIn, AuthSignedOut } from '@/auth/AuthWidgets.js';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';
import { useApi } from '@/hooks/useApi.js';

type Plan = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  isFree: boolean;
};

export function PricingPage() {
  const api = useApi();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    void (async () => {
      const data = await apiFetch<{ items: Plan[] }>('/api/plans');
      setPlans(data.items);
    })();
  }, []);

  async function subscribe(planSlug: string) {
    const origin = window.location.origin;
    const url = await api<{ url: string }>('/api/checkout/subscription', {
      method: 'POST',
      body: JSON.stringify({
        planSlug,
        successUrl: `${origin}/thank-you?type=subscription`,
        cancelUrl: `${origin}/pricing`,
        interval: 'month',
      }),
    });
    window.location.href = url.url;
  }

  return (
    <>
      <Helmet>
        <title>Pricing — Acme Platform</title>
        <meta name="description" content="Transparent plans for individuals and teams." />
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Start free, upgrade when you need production-grade controls.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              {p.description && <p className="mt-2 text-sm text-slate-600">{p.description}</p>}
              <p className="mt-4 text-3xl font-bold">
                {p.isFree ? '$0' : `$${(p.monthlyPriceCents / 100).toFixed(0)}`}
                <span className="text-base font-normal text-slate-500"> /mo</span>
              </p>
              <AuthSignedIn>
                {!p.isFree && (
                  <button
                    type="button"
                    className="mt-6 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    onClick={() => void subscribe(p.slug)}
                  >
                    Subscribe with Stripe
                  </button>
                )}
              </AuthSignedIn>
              <AuthSignedOut>
                <Link
                  to="/login"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 no-underline hover:bg-slate-50"
                >
                  Sign in to subscribe
                </Link>
              </AuthSignedOut>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
