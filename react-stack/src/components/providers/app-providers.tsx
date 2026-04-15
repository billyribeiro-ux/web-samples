"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { capturePageview, initPosthog } from "@/lib/analytics";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    initPosthog();
  }, []);

  useEffect(() => {
    capturePageview(pathname);
  }, [pathname]);

  return <SessionProvider>{children}</SessionProvider>;
}
