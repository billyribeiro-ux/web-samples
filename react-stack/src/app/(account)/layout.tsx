import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/session";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/security", label: "Security" },
  { href: "/account/subscription", label: "Subscription" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/favorites", label: "Favorites" },
];

export default async function AccountShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
        <aside className="w-full shrink-0 sm:w-56">
          <p className="text-sm font-semibold">Account</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {session?.user?.email}
          </p>
          <nav className="mt-6 flex flex-col gap-1" aria-label="Account">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/members"
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
            >
              Members
            </Link>
          </nav>
          <form className="mt-8" action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </aside>
        <div className="min-w-0 flex-1 rounded-xl border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
