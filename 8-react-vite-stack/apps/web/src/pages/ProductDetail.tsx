import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

type Product = {
  title: string;
  slug: string;
  description?: string | null;
  body?: string | null;
  priceCents: number;
  currency: string;
  id: string;
};

export function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      const data = await apiFetch<Product>(`/api/products/${slug}`);
      setProduct(data);
    })();
  }, [slug]);

  async function addToCart() {
    if (!product) return;
    await apiFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    window.location.href = '/cart';
  }

  if (!product) {
    return (
      <Container>
        <p>Loading…</p>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.title} — Acme Store</title>
      </Helmet>
      <Container>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold">{product.title}</h1>
            {product.description && (
              <p className="mt-3 text-slate-600" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
            )}
            {product.body && (
              <div className="prose prose-slate mt-6" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.body) }} />
            )}
          </div>
          <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold">
              ${(product.priceCents / 100).toFixed(2)} <span className="text-base font-normal">{product.currency}</span>
            </p>
            <button
              type="button"
              onClick={() => void addToCart()}
              className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add to cart
            </button>
          </aside>
        </div>
      </Container>
    </>
  );
}
