import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SubscriptionActions } from "@/components/account/subscription-actions";
import { SubscribeProButton } from "@/components/account/subscribe-pro-button";

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sub = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage billing through Stripe Customer Portal when a subscription exists.
      </p>
      <div className="mt-8 rounded-lg border bg-background p-4">
        {sub ? (
          <>
            <p className="font-medium">{sub.plan.name}</p>
            <p className="text-sm text-muted-foreground">
              Status: {sub.status}
            </p>
            <div className="mt-4">
              <SubscriptionActions />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start a Pro subscription with Stripe Checkout (configure Price IDs
              on the plan and Stripe keys in env).
            </p>
            <div className="flex flex-wrap gap-3">
              <SubscribeProButton interval="month" />
              <SubscribeProButton interval="year" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
