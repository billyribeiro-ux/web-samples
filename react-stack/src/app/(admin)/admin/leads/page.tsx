import { prisma } from "@/lib/db";

export default async function AdminLeadsPage() {
  const leads = await prisma.formSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
      <div className="mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-4 py-3">{l.type}</td>
                <td className="px-4 py-3">{l.email ?? "—"}</td>
                <td className="px-4 py-3">{l.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
