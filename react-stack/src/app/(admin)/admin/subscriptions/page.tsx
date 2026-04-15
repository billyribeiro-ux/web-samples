import { prisma } from "@/lib/db";

export default async function AdminSubscriptionsPage() {
  const subs = await prisma.subscription.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: true, plan: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
      <div className="mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">{s.user.email}</td>
                <td className="px-4 py-3">{s.plan.name}</td>
                <td className="px-4 py-3">{s.status}</td>
              </tr>
            ))}
            {!subs.length ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-muted-foreground"
                  colSpan={3}
                >
                  No subscriptions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
