import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export default function DashboardPage() {
  const q = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const r = await apiFetch("/v1/admin/dashboard");
      return r.json() as Promise<{ counts: Record<string, number> }>;
    },
  });

  if (q.isPending) return <p>Loading…</p>;
  if (q.isError) return <p>Failed to load</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(q.data?.counts ?? {}).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">{k}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
