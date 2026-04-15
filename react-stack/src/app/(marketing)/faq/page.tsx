import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about the platform starter.",
};

const items = [
  {
    q: "Is this production-ready?",
    a: "Core flows are implemented with server-side validation, RBAC, and Stripe webhooks. You should still run a security review and harden secrets management for your threat model.",
  },
  {
    q: "Where is content stored?",
    a: "In PostgreSQL via Prisma. The admin area performs real CRUD — not mocked fixtures.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">FAQ</h1>
      <dl className="mt-10 space-y-8">
        {items.map((i) => (
          <div key={i.q}>
            <dt className="font-medium">{i.q}</dt>
            <dd className="mt-2 text-muted-foreground">{i.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
