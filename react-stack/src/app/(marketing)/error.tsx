"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const dbHint =
    error.message?.includes("denied access") ||
    error.message?.includes("PrismaClientInitializationError") ||
    error.message?.includes("Can't reach database");

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        This page could not be loaded
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {dbHint
          ? "The app could not reach PostgreSQL. Start the database, set DATABASE_URL in .env, then run npx prisma migrate deploy and npm run db:seed."
          : error.message || "An unexpected error occurred."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
