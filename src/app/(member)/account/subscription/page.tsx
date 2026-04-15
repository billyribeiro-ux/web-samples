import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensureDbUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/metadata";
import { ManageBillingButton } from "@/components/commerce/manage-billing-button";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Subscription",
  description: "Manage your plan.",
  path: "/account/subscription",
});

export default async function SubscriptionPage() {
  const user = await ensureDbUser();
  if (!user) return null;

  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Subscription</h1>
      {sub ? (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{sub.plan.name}</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Status: {sub.status}</p>
          {sub.currentPeriodEnd && (
            <p className="mt-1 text-sm text-zinc-500">
              Renews or ends: {sub.currentPeriodEnd.toLocaleDateString()}
            </p>
          )}
          <div className="mt-6">
            <ManageBillingButton />
          </div>
        </div>
      ) : (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">
          No active subscription.{" "}
          <Link href="/pricing" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            View plans
          </Link>
        </p>
      )}
    </div>
  );
}
