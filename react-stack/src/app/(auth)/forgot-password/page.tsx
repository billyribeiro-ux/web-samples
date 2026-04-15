"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    await forgotPasswordAction(null, fd);
    setPending(false);
    setOk(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we will send a reset link if the account exists.
      </p>
      {ok ? (
        <p className="mt-6 text-sm" role="status">
          If an account exists, check your inbox for the next steps.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
