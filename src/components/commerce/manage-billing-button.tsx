"use client";

import { useState } from "react";
import { createBillingPortalSessionAction } from "@/app/actions/stripe";

export function ManageBillingButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const url = await createBillingPortalSessionAction();
          if (url) window.location.href = url;
        } finally {
          setPending(false);
        }
      }}
      className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
    >
      {pending ? "Opening…" : "Billing portal"}
    </button>
  );
}
