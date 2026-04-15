"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateCartItem } from "@/actions/cart";

export function CartControls({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await updateCartItem(productId, quantity - 1);
          })
        }
        aria-label="Decrease quantity"
      >
        −
      </Button>
      <span className="w-8 text-center text-sm">{quantity}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await updateCartItem(productId, quantity + 1);
          })
        }
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
}
