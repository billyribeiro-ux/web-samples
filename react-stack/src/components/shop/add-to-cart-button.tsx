"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart";
import { trackEvent } from "@/lib/analytics";

export function AddToCartButton({ productId }: { productId: string }) {
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await addToCart(productId, 1);
          trackEvent("add_to_cart", { productId });
        });
      }}
    >
      {pending ? "Adding…" : "Add to cart"}
    </Button>
  );
}
