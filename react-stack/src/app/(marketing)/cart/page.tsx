import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { CartControls } from "@/components/shop/cart-controls";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false },
};

export default async function CartPage() {
  const cart = await getCart();
  const ids = Object.keys(cart);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
  });
  const total = products.reduce(
    (sum, p) => sum + p.priceCents * (cart[p.id] ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      {products.length === 0 ? (
        <p className="mt-8 text-muted-foreground">Your cart is empty.</p>
      ) : (
        <ul className="mt-8 divide-y rounded-xl border">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${(p.priceCents / 100).toFixed(2)} each
                </p>
              </div>
              <CartControls productId={p.id} quantity={cart[p.id] ?? 1} />
            </li>
          ))}
        </ul>
      )}
      {products.length ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="text-lg font-semibold">
            Total: ${(total / 100).toFixed(2)}
          </p>
          <Button asChild>
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
