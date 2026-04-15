"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/actions/forms";

export function NewsletterForm() {
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await subscribeNewsletter(null, fd);
    setOk(true);
  }

  if (ok) {
    return (
      <p className="text-xs text-muted-foreground" role="status">
        You are on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email
      </label>
      <Input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="you@company.com"
        className="h-9"
      />
      <Button type="submit" size="sm" variant="secondary">
        Subscribe
      </Button>
    </form>
  );
}
