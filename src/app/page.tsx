const stack = [
  { name: "Next.js 15", detail: "App Router, Turbopack dev" },
  { name: "React 19", detail: "Server & client components" },
  { name: "Tailwind CSS", detail: "Utility-first styling" },
  { name: "Prisma", detail: "Database client (schema not added yet)" },
  { name: "Auth.js v5", detail: "Credentials / OAuth ready to wire" },
  { name: "Stripe & Resend", detail: "Payments & email (integrate as needed)" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16 sm:py-24">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            web-samples / 1-react-stack
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Next.js sample (scaffold)
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
            This folder is intentionally minimal: it is the default{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-sm dark:bg-white/[.08]">
              create-next-app
            </code>{" "}
            shell plus dependencies listed in{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-sm dark:bg-white/[.08]">
              package.json
            </code>
            . There are no feature routes yet—only this page and the root layout.
          </p>
        </header>

        <section className="rounded-2xl border border-black/[.08] bg-black/[.02] p-6 dark:border-white/[.12] dark:bg-white/[.03]">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Declared stack
          </h2>
          <ul className="divide-y divide-black/[.06] dark:divide-white/[.08]">
            {stack.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js docs
          </a>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/[.12] px-6 text-sm font-medium dark:border-white/[.18]"
            href="https://github.com/vercel/next.js/tree/canary/examples"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official examples
          </a>
        </section>

        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          Edit{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">
            src/app/page.tsx
          </code>{" "}
          to build out this sample.
        </p>
      </div>
    </div>
  );
}
