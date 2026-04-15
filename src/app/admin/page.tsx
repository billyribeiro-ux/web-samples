import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [posts, orders, leads] = await Promise.all([
    prisma.post.count(),
    prisma.order.count(),
    prisma.formSubmission.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Operational snapshot (live database counts).</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Posts", value: posts },
          { label: "Orders", value: orders },
          { label: "Form submissions", value: leads },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
