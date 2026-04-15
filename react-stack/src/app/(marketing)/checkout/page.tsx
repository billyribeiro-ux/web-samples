"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    setLoading(false);
    if (!res.ok || !data.url) {
      setError(data.error ?? "Checkout unavailable. Configure Stripe keys.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-4 text-muted-foreground">
        You will be redirected to Stripe Checkout. Orders sync via webhook into
        Postgres.
      </p>
      {error ? (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button className="mt-8" onClick={pay} disabled={loading}>
        {loading ? "Redirecting…" : "Pay with Stripe"}
      </Button>
    </div>
  );
}
