import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { useApi } from '@/hooks/useApi.js';
import { Container } from '@/components/Container.js';
import { RequireAuth } from '@/components/RequireAuth.js';

type Rule = { slug: string; title: string; body: string };

function MembersInner() {
  const api = useApi();
  const [items, setItems] = useState<Rule[]>([]);

  useEffect(() => {
    void api<{ items: Rule[] }>('/api/me/library').then((d) => setItems(d.items));
  }, [api]);

  return (
    <>
      <Helmet>
        <title>Member library — Acme</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Member library</h1>
        <div className="mt-8 space-y-8">
          {items.map((r) => (
            <article key={r.slug} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{r.title}</h2>
              <div className="prose prose-slate mt-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(r.body) }} />
            </article>
          ))}
          {items.length === 0 && <p className="text-slate-600">No library items available.</p>}
        </div>
      </Container>
    </>
  );
}

export function MembersPage() {
  return (
    <RequireAuth>
      <MembersInner />
    </RequireAuth>
  );
}
