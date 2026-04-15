import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminPagesListPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
      <div className="mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <Link href={`/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.slug}</td>
                <td className="px-4 py-3">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
