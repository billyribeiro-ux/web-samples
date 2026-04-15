import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensureDbUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Orders",
  description: "Your order history.",
  path: "/account/orders",
});

export default async function OrdersPage() {
  const user = await ensureDbUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Orders</h1>
      <ul className="mt-8 space-y-6">
        {orders.map((o) => (
          <li key={o.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-mono text-xs text-zinc-500">{o.id}</p>
              <p className="text-sm text-zinc-500">{o.createdAt.toLocaleString()}</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {(o.totalCents / 100).toLocaleString("en-US", { style: "currency", currency: o.currency })}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Status: {o.status}</p>
            <ul className="mt-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.titleSnapshot} × {i.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {orders.length === 0 && <p className="mt-8 text-zinc-500">No orders yet.</p>}
      <Link href="/services" className="mt-10 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        Continue shopping
      </Link>
    </div>
  );
}
