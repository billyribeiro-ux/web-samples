import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export default function SearchPage() {
  const [q, setQ] = useState("");

  const search = useQuery({
    queryKey: ["admin-search", q],
    enabled: q.length > 1,
    queryFn: async () => {
      const r = await apiFetch(`/v1/admin/search?q=${encodeURIComponent(q)}`);
      return (await r.json()) as { hits: { kind: string; title: string; slug: string }[] };
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    setQ(String(fd.get("q") ?? ""));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin search</h1>
      <form className="mt-4 flex gap-2" onSubmit={onSubmit}>
        <input className="max-w-md flex-1 rounded border px-2 py-1 text-sm" name="q" defaultValue={q} placeholder="Search…" />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white" type="submit">
          Run
        </button>
      </form>
      {search.isFetching && <p className="mt-4 text-sm text-slate-600">Searching…</p>}
      <ul className="mt-4 space-y-2 text-sm">
        {search.data?.hits.map((h, i) => (
          <li key={`${h.kind}-${h.slug}-${i}`}>
            <span className="text-xs uppercase text-slate-500">{h.kind}</span> {h.title}{" "}
            <span className="text-slate-400">({h.slug})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
