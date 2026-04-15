"use client";

import { useState } from "react";
import { createSubscriptionCheckoutAction } from "@/app/actions/stripe";

export function SubscribeButton({ planSlug, interval }: { planSlug: string; interval: "month" | "year" }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const url = await createSubscriptionCheckoutAction(planSlug, interval);
          if (url) window.location.href = url;
        } finally {
          setPending(false);
        }
      }}
      className="w-full rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
    >
      {pending ? "Redirecting…" : `Subscribe ${interval === "year" ? "yearly" : "monthly"}`}
    </button>
  );
}
