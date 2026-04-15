"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { subscribeNewsletterAction } from "@/app/actions/forms";

const schema = z.object({
  email: z.string().email(),
});

type Form = z.infer<typeof schema>;

export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row"
      onSubmit={form.handleSubmit(async (data) => {
        const res = await subscribeNewsletterAction(data);
        if (res.ok) setDone(true);
      })}
    >
      <input
        type="email"
        placeholder="you@company.com"
        className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        {...form.register("email")}
        aria-label="Email for newsletter"
      />
      <button
        type="submit"
        disabled={form.formState.isSubmitting || done}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
      >
        {done ? "Subscribed" : "Subscribe"}
      </button>
    </form>
  );
}
