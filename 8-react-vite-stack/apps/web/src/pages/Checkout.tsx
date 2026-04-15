import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppAuth } from '@/auth/app-auth-context.js';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

export function CheckoutPage() {
  const { isSignedIn, getToken } = useAppAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    try {
      const token = isSignedIn ? await getToken() : null;
      const origin = window.location.origin;
      const data = await apiFetch<{ url: string | null }>('/api/checkout/session', {
        method: 'POST',
        body: JSON.stringify({
          successUrl: `${origin}/thank-you?type=checkout`,
          cancelUrl: `${origin}/cart`,
          guestEmail: isSignedIn ? undefined : email || undefined,
        }),
        token,
      });
      if (data.url) window.location.href = data.url;
      else setError('Stripe Checkout URL missing.');
    } catch (e: unknown) {
      const msg = typeof e === 'object' && e && 'error' in e ? String((e as { error: string }).error) : 'Checkout failed';
      setError(msg);
    }
  }

  return (
    <>
      <Helmet>
        <title>Checkout — Acme Store</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Checkout</h1>
        {!isSignedIn && (
          <div className="mt-4 max-w-md">
            <label className="block text-sm font-medium text-slate-700" htmlFor="guest-email">
              Email (guest checkout)
            </label>
            <input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <button
          type="button"
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={() => void pay()}
        >
          Pay with Stripe
        </button>
      </Container>
    </>
  );
}
