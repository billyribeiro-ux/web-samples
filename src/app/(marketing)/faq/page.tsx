import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "FAQ",
  description: "Frequently asked questions.",
  path: "/faq",
});

const items = [
  {
    q: "How does billing work?",
    a: "Subscriptions are processed securely by Stripe. You can manage payment methods and invoices in the customer portal.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes—cancel from your account and retain access until the end of the billing period when applicable.",
  },
  {
    q: "Where is my data hosted?",
    a: "The reference deployment targets Vercel with PostgreSQL (e.g. Neon) and encrypted connections.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">FAQ</h1>
      <dl className="mt-12 space-y-10">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="text-lg font-medium text-zinc-900 dark:text-zinc-50">{item.q}</dt>
            <dd className="mt-2 text-zinc-600 dark:text-zinc-400">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
