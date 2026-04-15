import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/Container.js';
import { JsonLd } from '@/components/JsonLd.js';
import { apiFetch } from '@/lib/api.js';

type Post = { slug: string; title: string; excerpt?: string | null; readingMinutes: number };

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tagline, setTagline] = useState('Operate your digital business with confidence.');

  useEffect(() => {
    void (async () => {
      const [blog, site] = await Promise.all([
        apiFetch<{ items: Post[] }>('/api/posts?pageSize=3'),
        apiFetch<{ site: { tagline?: string } }>('/api/site').catch(() => null),
      ]);
      setPosts(blog.items);
      if (site?.site && typeof site.site === 'object' && 'tagline' in site.site) {
        setTagline(String(site.site.tagline ?? tagline));
      }
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Acme Platform — Modern operations for serious teams</title>
        <meta name="description" content={tagline} />
        <meta property="og:title" content="Acme Platform" />
        <meta property="og:description" content={tagline} />
      </Helmet>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Acme Platform',
          url: window.location.origin,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${window.location.origin}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <Container>
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-widest text-sky-200">Premium operations</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight">
            Ship faster with a platform built for growth, trust, and scale.
          </h1>
          <p className="mt-4 max-w-xl text-slate-200">{tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/pricing"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 no-underline hover:bg-slate-100"
            >
              View pricing
            </Link>
            <Link
              to="/contact"
              className="rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-white/10"
            >
              Talk to sales
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Memberships & billing',
              body: 'Stripe-backed subscriptions with self-serve portal and gated experiences.',
            },
            {
              title: 'Content & SEO',
              body: 'Editorial workflows, structured metadata, and search tuned for PostgreSQL FTS.',
            },
            {
              title: 'Headless CMS',
              body: 'Role-based admin for pages, posts, commerce, and operational data.',
            },
          ].map((c) => (
            <article key={c.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{c.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">From the journal</h2>
              <p className="mt-1 text-sm text-slate-600">Ideas for product, engineering, and growth.</p>
            </div>
            <Link to="/blog" className="text-sm font-medium text-sky-700 no-underline">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <article key={p.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">
                  <Link to={`/blog/${p.slug}`} className="no-underline hover:text-sky-800">
                    {p.title}
                  </Link>
                </h3>
                {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.excerpt}</p>}
                <p className="mt-3 text-xs text-slate-500">{p.readingMinutes} min read</p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
