import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container.js';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Not found</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">404</h1>
        <p className="mt-2 text-slate-600">This page does not exist.</p>
        <Link to="/" className="mt-6 inline-block text-sky-700 no-underline">
          Go home
        </Link>
      </Container>
    </>
  );
}
