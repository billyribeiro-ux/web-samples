import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { requireStripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripe = requireStripe();
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const stripeSubId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id;
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;
          if (stripeSubId && customerId && userId && planId) {
            const existingSub = await prisma.subscription.findUnique({
              where: { stripeSubscriptionId: stripeSubId },
            });
            if (!existingSub) {
              const remote = await stripe.subscriptions.retrieve(stripeSubId);
              const statusMap: Record<
                string,
                | "ACTIVE"
                | "CANCELED"
                | "PAST_DUE"
                | "TRIALING"
                | "INCOMPLETE"
                | "UNPAID"
              > = {
                active: "ACTIVE",
                canceled: "CANCELED",
                past_due: "PAST_DUE",
                trialing: "TRIALING",
                incomplete: "INCOMPLETE",
                unpaid: "UNPAID",
              };
              await prisma.subscription.create({
                data: {
                  userId,
                  planId,
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: stripeSubId,
                  status: statusMap[remote.status] ?? "INCOMPLETE",
                  cancelAtPeriodEnd: remote.cancel_at_period_end,
                  currentPeriodEnd: remote.current_period_end
                    ? new Date(remote.current_period_end * 1000)
                    : null,
                },
              });
            }
          }
          break;
        }

        const existingOrder = await prisma.order.findFirst({
          where: { stripeCheckoutSessionId: session.id },
        });
        if (existingOrder) {
          break;
        }
        const email =
          session.customer_details?.email ??
          session.customer_email ??
          "unknown@example.com";
        const userId = session.metadata?.userId;
        let items: {
          id: string;
          qty: number;
          unit: number;
          name: string;
        }[] = [];
        try {
          items = JSON.parse(session.metadata?.items ?? "[]") as typeof items;
        } catch {
          items = [];
        }
        if (!items.length) {
          break;
        }
        const subtotal = items.reduce((s, i) => s + i.unit * i.qty, 0);
        const orderItems = items.map((i) => ({
          productId: i.id,
          quantity: i.qty,
          unitCents: i.unit,
          nameSnapshot: i.name,
        }));

        await prisma.order.create({
          data: {
            userId: userId || null,
            email,
            status: "PAID",
            currency: session.currency ?? "usd",
            subtotalCents: subtotal,
            totalCents: session.amount_total ?? subtotal,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id,
            items: {
              create: orderItems,
            },
          },
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubId = sub.id;
        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: stripeSubId },
        });
        const customerId = sub.customer as string;
        const user = await prisma.user.findFirst({
          where: {
            subscriptions: { some: { stripeCustomerId: customerId } },
          },
        });
        const plan = await prisma.plan.findFirst({
          where: {
            OR: [
              { stripePriceMonthlyId: sub.items.data[0]?.price.id },
              { stripePriceYearlyId: sub.items.data[0]?.price.id },
            ],
          },
        });
        const statusMap: Record<string, "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE" | "UNPAID"> =
          {
            active: "ACTIVE",
            canceled: "CANCELED",
            past_due: "PAST_DUE",
            trialing: "TRIALING",
            incomplete: "INCOMPLETE",
            unpaid: "UNPAID",
          };
        const status = statusMap[sub.status] ?? "INCOMPLETE";
        if (existing && plan) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              status,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              currentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
            },
          });
        } else if (user && plan) {
          await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: plan.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: stripeSubId,
              status,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              currentPeriodEnd: sub.current_period_end
                ? new Date(sub.current_period_end * 1000)
                : null,
            },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return NextResponse.json({ received: true, error: true }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
