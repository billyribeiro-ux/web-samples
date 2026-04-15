import Link from "next/link";
import { getCartForSession } from "@/app/actions/cart";
import { checkoutCartAction } from "@/app/actions/checkout";
import { CartControls } from "@/components/commerce/cart-controls";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCartForSession();

  if (!cart?.items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Cart</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Your cart is empty.</p>
        <Link href="/services" className="mt-8 inline-block font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Browse products
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const currency = cart.items[0]?.product.currency ?? "usd";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Cart</h1>
      <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
        {cart.items.map((line) => (
          <li key={line.id} className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div>
              <Link href={`/services/${line.product.slug}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                {line.product.title}
              </Link>
              <p className="text-sm text-zinc-500">
                {(line.product.priceCents / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: line.product.currency,
                })}{" "}
                each
              </p>
            </div>
            <CartControls productId={line.productId} quantity={line.quantity} />
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Subtotal {(subtotal / 100).toLocaleString("en-US", { style: "currency", currency })}
        </p>
        <form action={checkoutCartAction}>
          <button
            type="submit"
            className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Checkout
          </button>
        </form>
      </div>
      {!process.env.STRIPE_SECRET_KEY && (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">Set STRIPE_SECRET_KEY to enable checkout.</p>
      )}
    </div>
  );
}
