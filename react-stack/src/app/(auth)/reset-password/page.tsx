"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/actions/auth";
import { Suspense } from "react";

function ResetInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    fd.set("token", token);
    const res = await resetPasswordAction(null, fd);
    setPending(false);
    if (res.error) setErr(res.error);
    else setOk(true);
  }

  if (!token) {
    return <p className="text-sm text-destructive">Missing token.</p>;
  }

  if (ok) {
    return (
      <p className="text-sm" role="status">
        Password updated.{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
      </div>
      {err ? (
        <p className="text-sm text-destructive" role="alert">
          {err}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <div className="mt-8">
        <Suspense>
          <ResetInner />
        </Suspense>
      </div>
    </div>
  );
}
