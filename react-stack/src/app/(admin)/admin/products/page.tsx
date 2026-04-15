import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      <div className="mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <Link
                    href={`/products/${p.slug}`}
                    className="hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">
                  ${(p.priceCents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
