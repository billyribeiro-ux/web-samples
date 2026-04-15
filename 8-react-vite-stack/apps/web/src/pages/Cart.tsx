import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

type Cart = {
  items: { id: string; quantity: number; product: { id: string; title: string; slug: string; priceCents: number } }[];
};

export function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  async function refresh() {
    const data = await apiFetch<{ cart: Cart }>('/api/cart');
    setCart(data.cart);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <>
      <Helmet>
        <title>Cart — Acme Store</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Cart</h1>
        {!cart && <p className="mt-4 text-slate-600">Loading…</p>}
        {cart && cart.items.length === 0 && <p className="mt-4 text-slate-600">Your cart is empty.</p>}
        {cart && cart.items.length > 0 && (
          <ul className="mt-6 space-y-4">
            {cart.items.map((line) => (
              <li key={line.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                <div>
                  <Link to={`/products/${line.product.slug}`} className="font-semibold no-underline">
                    {line.product.title}
                  </Link>
                  <p className="text-sm text-slate-600">Qty {line.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${((line.product.priceCents * line.quantity) / 100).toFixed(2)}</p>
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-700"
                    onClick={() =>
                      void (async () => {
                        await apiFetch(`/api/cart/items/${line.product.id}`, { method: 'DELETE' });
                        await refresh();
                      })()
                    }
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cart && cart.items.length > 0 && (
          <div className="mt-8">
            <Link
              to="/checkout"
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline"
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </Container>
    </>
  );
}
