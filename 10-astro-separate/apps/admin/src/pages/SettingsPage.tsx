import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export default function SettingsPage() {
  const q = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const r = await apiFetch("/v1/admin/settings");
      return (await r.json()) as { settings: { key: string; value: unknown }[] };
    },
  });

  if (q.isPending) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Site settings</h1>
      <ul className="mt-4 space-y-3 text-sm">
        {q.data?.settings.map((s) => (
          <li key={s.key} className="rounded border border-slate-200 bg-white p-3">
            <div className="font-mono text-xs text-slate-500">{s.key}</div>
            <pre className="mt-2 max-h-40 overflow-auto text-xs">{JSON.stringify(s.value, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
