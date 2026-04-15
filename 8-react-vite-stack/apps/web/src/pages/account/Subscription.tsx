import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useApi } from '@/hooks/useApi.js';

export function SubscriptionPage() {
  const api = useApi();
  const [info, setInfo] = useState<string>('Loading…');

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<{ subscription: { status: string; plan: { name: string } } | null }>(
          '/api/me/subscription'
        );
        if (!data.subscription) setInfo('No active subscription.');
        else setInfo(`${data.subscription.plan.name} — ${data.subscription.status}`);
      } catch {
        setInfo('Unable to load subscription.');
      }
    })();
  }, [api]);

  async function openPortal() {
    const origin = window.location.origin;
    const data = await api<{ url: string }>('/api/me/billing-portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl: `${origin}/account/subscription` }),
    });
    window.location.href = data.url;
  }

  return (
    <>
      <Helmet>
        <title>Subscription — Acme</title>
      </Helmet>
      <h1 className="text-2xl font-semibold">Subscription</h1>
      <p className="mt-2 text-slate-700">{info}</p>
      <button
        type="button"
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        onClick={() => void openPortal().catch(() => alert('Billing portal unavailable'))}
      >
        Open billing portal
      </button>
    </>
  );
}
