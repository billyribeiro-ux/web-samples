import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export default function PagesPage() {
  const q = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const r = await apiFetch("/v1/admin/pages");
      return (await r.json()) as { pages: { id: string; slug: string; title: string; status: string }[] };
    },
  });

  if (q.isPending) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pages</h1>
      <ul className="mt-4 space-y-2 text-sm">
        {q.data?.pages.map((p) => (
          <li key={p.id} className="rounded border border-slate-200 bg-white px-3 py-2">
            <span className="font-medium">{p.title}</span> <span className="text-slate-500">/{p.slug}</span>{" "}
            <span className="text-xs uppercase text-slate-400">{p.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
