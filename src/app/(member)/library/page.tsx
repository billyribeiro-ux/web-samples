import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { ensureDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Members library",
  description: "Subscriber-only resources.",
  path: "/library",
});

export default async function LibraryPage() {
  const user = await ensureDbUser();
  if (!user) redirect("/login");

  const allowed =
    user.role === UserRole.SUBSCRIBER ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.EDITOR;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Members only</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Subscribe to unlock this library.</p>
        <a
          href="/pricing"
          className="mt-8 inline-block rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          View plans
        </a>
      </div>
    );
  }

  const rules = await prisma.gatedContentRule.findMany({ include: { plan: true } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Library</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Welcome to the member library. Gated rules in the database control access by role or plan.
      </p>
      {rules.length > 0 && (
        <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          {rules.map((r) => (
            <li key={r.id}>
              Path pattern: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{r.pathPattern}</code>
              {r.plan && ` — plan: ${r.plan.slug}`}
              {r.requiredRole && ` — role: ${r.requiredRole}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
