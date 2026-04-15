"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscribeProButton({
  interval = "month",
}: {
  interval?: "month" | "year";
}) {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/billing/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSlug: "pro", interval }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    setLoading(false);
    if (!res.ok || !data.url) {
      setErr(data.error ?? "Could not start checkout");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <Button type="button" onClick={go} disabled={loading}>
        {loading
          ? "Redirecting…"
          : interval === "year"
            ? "Subscribe yearly"
            : "Subscribe monthly"}
      </Button>
      {err ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
