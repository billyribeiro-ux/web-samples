import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/Container.js';

const items = [
  {
    q: 'Is this a production-ready template?',
    a: 'It is a serious reference architecture: real data models, secured admin, Stripe and Clerk integration points, and clear seams for hardening.',
  },
  {
    q: 'How do I grant admin access?',
    a: 'After your first Clerk sign-in, promote your user role in the database (EDITOR or above) or use the admin user management screen.',
  },
  {
    q: 'Where is media stored?',
    a: 'Configure S3-compatible credentials; the API issues presigned uploads and stores metadata in PostgreSQL.',
  },
];

export function FaqPage() {
  return (
    <>
      <Helmet>
        <title>FAQ — Acme Platform</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">FAQ</h1>
        <div className="mt-8 space-y-6">
          {items.map((i) => (
            <section key={i.q} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{i.q}</h2>
              <p className="mt-2 text-slate-600">{i.a}</p>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
