import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/roles", label: "Roles" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/seo", label: "SEO" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  const allowed = roles.some((r) =>
    ["super_admin", "admin", "editor"].includes(r),
  );
  if (!session?.user || !allowed) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r bg-card p-4 lg:block">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Admin
        </p>
        <nav className="mt-4 flex flex-col gap-1" aria-label="Admin">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-6 lg:p-10">{children}</div>
    </div>
  );
}
