import Link from "next/link";
import { getBrandName, getMainNav } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { MobileNav } from "@/components/marketing/mobile-nav";

export async function SiteHeader() {
  const [brand, nav, session] = await Promise.all([
    getBrandName(),
    getMainNav(),
    auth(),
  ]);

  const mobileNav = [
    ...nav,
    { href: "/search", label: "Search" },
    { href: "/cart", label: "Cart" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MobileNav nav={mobileNav} />
          <Link href="/" className="font-semibold tracking-tight">
            {brand}
          </Link>
        </div>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/search">Search</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/cart">Cart</Link>
          </Button>
          {session?.user ? (
            <Button asChild>
              <Link href="/account">Account</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
