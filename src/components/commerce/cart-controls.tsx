"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCartQuantityAction } from "@/app/actions/cart";

export function CartControls({ productId, quantity }: { productId: string; quantity: number }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function update(next: number) {
    start(async () => {
      await setCartQuantityAction(productId, next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
        onClick={() => update(quantity - 1)}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm">{quantity}</span>
      <button
        type="button"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
        onClick={() => update(quantity + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
