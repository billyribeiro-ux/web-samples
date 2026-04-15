"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { submitContactAction } from "@/app/actions/forms";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email(),
  message: z.string().min(10, "Please add a bit more detail"),
});

type Form = z.infer<typeof schema>;

export function ContactForm({ className = "" }: { className?: string }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <form
      className={`space-y-4 ${className}`}
      onSubmit={form.handleSubmit(async (data) => {
        setServerError(null);
        const res = await submitContactAction(data);
        if (res.ok) setDone(true);
        else setServerError(res.error ?? "Something went wrong");
      })}
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="name"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          {...form.register("message")}
        />
        {form.formState.errors.message && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.message.message}</p>
        )}
      </div>
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}
      {done ? (
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Thanks — we received your message.</p>
      ) : (
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-950"
        >
          {form.formState.isSubmitting ? "Sending…" : "Send"}
        </button>
      )}
    </form>
  );
}
