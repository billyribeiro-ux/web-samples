import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { Container } from '@/components/Container.js';

export function ThankYouPage() {
  const [params] = useSearchParams();
  const type = params.get('type') ?? 'generic';

  return (
    <>
      <Helmet>
        <title>Thank you — Acme</title>
      </Helmet>
      <Container>
        <h1 className="text-3xl font-semibold">Thank you</h1>
        <p className="mt-3 text-slate-600">
          {type === 'checkout' && 'Your payment is processing. You will receive a confirmation email shortly.'}
          {type === 'subscription' && 'Your subscription is being activated.'}
          {type === 'generic' && 'Your request was received.'}
        </p>
        <Link to="/" className="mt-6 inline-block text-sky-700 no-underline">
          Back home
        </Link>
      </Container>
    </>
  );
}
