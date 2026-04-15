import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";
import { SubscribeButton } from "@/components/commerce/subscribe-button";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Pricing",
  description: "Plans for individuals and growing teams. Subscriptions via Stripe.",
  path: "/pricing",
});

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-center text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Pricing</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-zinc-600 dark:text-zinc-400">
        Simple plans. Upgrade, downgrade, or cancel from the billing portal anytime.
      </p>
      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
            <p className="mt-6 text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
              {(plan.monthlyAmountCents / 100).toLocaleString("en-US", {
                style: "currency",
                currency: plan.currency,
              })}
              <span className="text-lg font-normal text-zinc-500">/mo</span>
            </p>
            {plan.yearlyAmountCents && (
              <p className="text-sm text-zinc-500">
                or {(plan.yearlyAmountCents / 100).toLocaleString("en-US", { style: "currency", currency: plan.currency })}{" "}
                / year
              </p>
            )}
            <ul className="mt-8 flex-1 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              {Array.isArray(plan.features) &&
                (plan.features as string[]).map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
            </ul>
            <div className="mt-8">
              <SubscribeButton planSlug={plan.slug} interval="month" />
            </div>
          </div>
        ))}
      </div>
      {plans.length === 0 && <p className="mt-8 text-center text-zinc-500">No plans configured. Seed the database.</p>}
      <p className="mt-12 text-center text-sm text-zinc-500">
        Already a customer?{" "}
        <Link href="/account/subscription" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Manage subscription
        </Link>
      </p>
    </div>
  );
}
