import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canAccessMembersRoute } from "@/lib/gating";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const staff = session.user.roles.some((r) =>
    ["super_admin", "admin", "editor"].includes(r),
  );
  const allowed =
    staff || (await canAccessMembersRoute(session.user.id));
  if (!allowed) {
    redirect("/pricing?reason=members");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Members library</h1>
      <p className="mt-4 text-muted-foreground">
        This route is protected by subscription rules stored in{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">GatedContentRule</code>.
        Swap the rule to target pages, posts, or arbitrary paths.
      </p>
    </div>
  );
}
