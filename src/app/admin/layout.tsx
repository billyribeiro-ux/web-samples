import Link from "next/link";
import { requireAdminOrEditor } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOrEditor();

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/posts", label: "Posts" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/plans", label: "Plans" },
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-52 shrink-0 md:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Admin</p>
          <nav className="mt-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-white hover:shadow dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-8 block text-sm text-emerald-700 hover:underline dark:text-emerald-400">
            ← Site
          </Link>
        </aside>
        <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {children}
        </div>
      </div>
    </div>
  );
}
