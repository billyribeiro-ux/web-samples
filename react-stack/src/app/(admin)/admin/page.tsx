import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [posts, orders, leads] = await Promise.all([
    prisma.post.count(),
    prisma.order.count(),
    prisma.formSubmission.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Operational snapshot from Postgres.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Posts</p>
          <p className="mt-2 text-3xl font-semibold">{posts}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Orders</p>
          <p className="mt-2 text-3xl font-semibold">{orders}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Leads</p>
          <p className="mt-2 text-3xl font-semibold">{leads}</p>
        </div>
      </div>
    </div>
  );
}
