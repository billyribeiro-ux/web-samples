import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Products</h1>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-3 font-medium text-zinc-500">Title</th>
            <th className="pb-3 font-medium text-zinc-500">Price</th>
            <th className="pb-3 font-medium text-zinc-500">Published</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
              <td className="py-3">{p.title}</td>
              <td className="py-3">
                {(p.priceCents / 100).toLocaleString("en-US", { style: "currency", currency: p.currency })}
              </td>
              <td className="py-3">{p.published ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
