import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Orders</h1>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-3 font-medium text-zinc-500">ID</th>
            <th className="pb-3 font-medium text-zinc-500">Total</th>
            <th className="pb-3 font-medium text-zinc-500">Status</th>
            <th className="pb-3 font-medium text-zinc-500">When</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
              <td className="py-3 font-mono text-xs">{o.id.slice(0, 12)}…</td>
              <td className="py-3">
                {(o.totalCents / 100).toLocaleString("en-US", { style: "currency", currency: o.currency })}
              </td>
              <td className="py-3">{o.status}</td>
              <td className="py-3 text-zinc-500">{o.createdAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
