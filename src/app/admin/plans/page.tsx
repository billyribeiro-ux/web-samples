import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Plans</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Stripe price IDs are stored on each plan. Set env/seed for Checkout to work end-to-end.
      </p>
      <ul className="mt-8 space-y-4">
        {plans.map((p) => (
          <li key={p.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p>
            <p className="text-xs text-zinc-500">slug: {p.slug}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Monthly price ID: {p.stripePriceMonthlyId ?? "—"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
