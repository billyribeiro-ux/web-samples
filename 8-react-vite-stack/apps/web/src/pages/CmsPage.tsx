import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { Container } from '@/components/Container.js';
import { apiFetch } from '@/lib/api.js';

type Page = {
  title: string;
  body: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function CmsPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<Page>(`/api/pages/${slug}`);
        setPage(data);
      } catch {
        setError('Unable to load this page.');
      }
    })();
  }, [slug]);

  if (error) {
    return (
      <Container>
        <p className="text-red-700">{error}</p>
      </Container>
    );
  }
  if (!page) {
    return (
      <Container>
        <p className="text-slate-600">Loading…</p>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.seoTitle ?? page.title}</title>
        {page.seoDescription && <meta name="description" content={page.seoDescription} />}
      </Helmet>
      <Container>
        <article className="prose prose-slate mx-auto max-w-3xl">
          <h1>{page.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.body) }} />
        </article>
      </Container>
    </>
  );
}
