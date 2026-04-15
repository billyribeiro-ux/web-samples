"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscriptionActions() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    setLoading(false);
    if (!res.ok || !data.url) {
      setErr(data.error ?? "Portal unavailable");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <Button type="button" onClick={openPortal} disabled={loading}>
        {loading ? "Opening…" : "Billing portal"}
      </Button>
      {err ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
