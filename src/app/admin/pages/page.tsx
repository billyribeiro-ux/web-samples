import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Pages</h1>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-3 font-medium text-zinc-500">Title</th>
            <th className="pb-3 font-medium text-zinc-500">Slug</th>
            <th className="pb-3 font-medium text-zinc-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
              <td className="py-3">{p.title}</td>
              <td className="py-3 font-mono text-xs text-zinc-500">/{p.slug}</td>
              <td className="py-3">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages.length === 0 && <p className="mt-8 text-zinc-500">No CMS pages yet.</p>}
      <p className="mt-8 text-sm text-zinc-500">
        Full page editor can extend the post editor pattern. Seed creates legal pages as records.
      </p>
    </div>
  );
}
