import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { requireStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    planSlug?: string;
    interval?: "month" | "year";
  };
  const planSlug = body.planSlug ?? "pro";
  const interval = body.interval === "year" ? "year" : "month";

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan || plan.isDefaultFree) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId =
    interval === "year"
      ? plan.stripePriceYearlyId
      : plan.stripePriceMonthlyId;
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Stripe Price IDs are not configured. Set stripePriceMonthlyId / stripePriceYearlyId on the plan and STRIPE_SECRET_KEY.",
      },
      { status: 501 },
    );
  }

  const stripe = requireStripe();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/account/subscription?checkout=success`,
    cancel_url: `${base}/pricing`,
    metadata: {
      userId: session.user.id,
      planId: plan.id,
    },
    subscription_data: {
      metadata: {
        userId: session.user.id,
        planId: plan.id,
      },
    },
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "No checkout URL" }, { status: 500 });
  }

  return NextResponse.json({ url: checkout.url });
}
