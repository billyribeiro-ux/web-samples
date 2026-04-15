"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/actions/profile";

export function ProfileForm(props: {
  name: string;
  marketingEmails: boolean;
  newsletterOptIn: boolean;
  productUpdates: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await updateProfile(fd);
    setStatus(res.ok ? "ok" : "err");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={props.name}
          required
          autoComplete="name"
        />
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Notifications</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="productUpdates"
            defaultChecked={props.productUpdates}
          />
          Product updates
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="marketingEmails"
            defaultChecked={props.marketingEmails}
          />
          Marketing emails
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="newsletterOptIn"
            defaultChecked={props.newsletterOptIn}
          />
          Newsletter
        </label>
      </fieldset>
      {status === "ok" ? (
        <p className="text-sm text-green-600" role="status">
          Saved.
        </p>
      ) : null}
      {status === "err" ? (
        <p className="text-sm text-destructive" role="alert">
          Could not save.
        </p>
      ) : null}
      <Button type="submit">Save changes</Button>
    </form>
  );
}
