"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export function SiteHeaderAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" aria-hidden />;
  }

  if (!isSignedIn) {
    return (
      <>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
        >
          Sign up
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/account"
        className="hidden text-sm font-medium text-zinc-700 sm:inline dark:text-zinc-300"
      >
        Account
      </Link>
      <UserButton />
    </>
  );
}
