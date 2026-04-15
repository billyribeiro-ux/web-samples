import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Orders created after successful Stripe Checkout webhooks.
      </p>
      <ul className="mt-8 divide-y rounded-lg border">
        {orders.map((o) => (
          <li key={o.id} className="p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium">
                {new Date(o.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{o.status}</p>
            </div>
            <p className="mt-2 text-sm">
              Total: ${(o.totalCents / 100).toFixed(2)} {o.currency.toUpperCase()}
            </p>
            <ul className="mt-2 text-sm text-muted-foreground">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.nameSnapshot} × {i.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {!orders.length ? (
          <li className="p-4 text-sm text-muted-foreground">No orders yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
