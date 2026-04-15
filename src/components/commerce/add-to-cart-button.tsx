"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCartAction } from "@/app/actions/cart";

export function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await addToCartAction(productId, 1);
      router.push("/cart");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-500 disabled:opacity-60"
    >
      {pending ? "Adding…" : "Add to cart"}
    </button>
  );
}
