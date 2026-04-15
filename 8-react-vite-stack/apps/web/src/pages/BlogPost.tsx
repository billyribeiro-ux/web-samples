import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { Container } from '@/components/Container.js';
import { JsonLd } from '@/components/JsonLd.js';
import { apiFetch } from '@/lib/api.js';

type Post = {
  title: string;
  slug: string;
  body: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  readingMinutes: number;
  publishedAt?: string | null;
  author?: { name: string } | null;
  category?: { name: string; slug: string } | null;
  related: { slug: string; title: string }[];
};

export function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      const data = await apiFetch<Post>(`/api/posts/${slug}`);
      setPost(data);
    })();
  }, [slug]);

  if (!post) {
    return (
      <Container>
        <p className="text-slate-600">Loading…</p>
      </Container>
    );
  }

  const url = post.canonicalUrl ?? `${window.location.origin}/blog/${post.slug}`;

  return (
    <>
      <Helmet>
        <title>{post.seoTitle ?? post.title}</title>
        {post.seoDescription && <meta name="description" content={post.seoDescription} />}
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.seoTitle ?? post.title} />
        {post.seoDescription && <meta property="og:description" content={post.seoDescription} />}
      </Helmet>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.publishedAt,
          author: post.author ? { '@type': 'Person', name: post.author.name } : undefined,
          mainEntityOfPage: url,
        }}
      />
      <Container>
        <article className="prose prose-slate mx-auto max-w-3xl">
          <p className="not-prose text-sm text-slate-500">
            {post.category && (
              <Link to={`/category/${post.category.slug}`} className="font-medium text-sky-700 no-underline">
                {post.category.name}
              </Link>
            )}
            {post.author && <span className="ml-2">· {post.author.name}</span>}
            <span className="ml-2">· {post.readingMinutes} min read</span>
          </p>
          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body) }} />
        </article>
        {post.related?.length > 0 && (
          <section className="mx-auto mt-12 max-w-3xl">
            <h2 className="text-lg font-semibold">Related</h2>
            <ul className="mt-3 space-y-2">
              {post.related.map((r) => (
                <li key={r.slug}>
                  <Link to={`/blog/${r.slug}`} className="text-sky-700 no-underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
