import Link from "next/link";
import { ensureDbUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await ensureDbUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Account</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Signed in as {user?.email}
        {user && (
          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {user.role}
          </span>
        )}
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { href: "/account/profile", label: "Profile" },
          { href: "/account/subscription", label: "Subscription" },
          { href: "/account/orders", label: "Orders" },
          { href: "/account/favorites", label: "Favorites" },
          { href: "/library", label: "Members library" },
        ].map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-xl border border-zinc-200 bg-white p-4 font-medium text-zinc-900 shadow-sm hover:border-emerald-500/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
