import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { requireStripe } from "@/lib/stripe";
import { auth } from "@/auth";
import { z } from "zod";

const cartSchema = z.record(z.string(), z.number().int().positive());

export async function POST(req: Request) {
  const stripe = requireStripe();
  const session = await auth();
  const body = await req.json().catch(() => ({}));
  const successUrl =
    typeof body.successUrl === "string"
      ? body.successUrl
      : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/thank-you?type=order`;
  const cancelUrl =
    typeof body.cancelUrl === "string"
      ? body.cancelUrl
      : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/cart`;

  const c = await cookies();
  const raw = c.get("cart")?.value;
  if (!raw) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  let cart: Record<string, number>;
  try {
    cart = cartSchema.parse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const ids = Object.keys(cart);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
  });
  if (!products.length) {
    return NextResponse.json({ error: "No valid products" }, { status: 400 });
  }

  const line_items = products.map((p) => ({
    quantity: cart[p.id] ?? 1,
    price_data: {
      currency: p.currency,
      unit_amount: p.priceCents,
      product_data: {
        name: p.name,
      },
    },
  }));

  const itemsMeta = products.map((p) => ({
    id: p.id,
    qty: cart[p.id] ?? 1,
    unit: p.priceCents,
    name: p.name,
  }));

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    line_items,
    customer_email: session?.user?.email ?? undefined,
    metadata: {
      userId: session?.user?.id ?? "",
      items: JSON.stringify(itemsMeta),
    },
  });

  return NextResponse.json({ url: checkout.url });
}
