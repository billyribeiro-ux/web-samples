import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const subs = await prisma.formSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Leads & submissions</h1>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-3 font-medium text-zinc-500">Type</th>
            <th className="pb-3 font-medium text-zinc-500">Email</th>
            <th className="pb-3 font-medium text-zinc-500">When</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
              <td className="py-3">{s.type}</td>
              <td className="py-3">{s.email ?? "—"}</td>
              <td className="py-3 text-zinc-500">{s.createdAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
