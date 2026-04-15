import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function AccountHomePage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Signed in as {session?.user?.email}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm font-medium">Members library</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Gated routes check an active subscription in Postgres.
          </p>
          <Button asChild className="mt-4" variant="secondary" size="sm">
            <Link href="/members">Open members area</Link>
          </Button>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm font-medium">Admin</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Editors and admins manage content in the CMS.
          </p>
          <Button asChild className="mt-4" variant="secondary" size="sm">
            <Link href="/admin">Open admin</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
