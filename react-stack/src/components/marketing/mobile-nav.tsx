"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NavItem = { href: string; label: string };

export function MobileNav({
  nav,
  brandHref = "/",
}: {
  nav: NavItem[];
  brandHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle>
            <DialogClose asChild>
              <Link href={brandHref} className="hover:underline">
                Menu
              </Link>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <nav
          className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto px-2 py-4"
          aria-label="Mobile primary"
        >
          {nav.map((item) => (
            <DialogClose key={item.href} asChild>
              <Link
                href={item.href}
                className="rounded-md px-4 py-3 text-sm font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            </DialogClose>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
