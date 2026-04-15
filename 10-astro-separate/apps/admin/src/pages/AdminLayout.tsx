import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

const links = [
  ["Dashboard", "/admin"],
  ["Posts", "/admin/posts"],
  ["Pages", "/admin/pages"],
  ["Media", "/admin/media"],
  ["Settings", "/admin/settings"],
  ["Search", "/admin/search"],
];

export default function AdminLayout() {
  const nav = useNavigate();
  const gate = useQuery({
    queryKey: ["admin-gate"],
    queryFn: async () => {
      const r = await apiFetch("/v1/admin/dashboard");
      if (r.status === 401) throw new Error("401");
      if (!r.ok) throw new Error("fail");
      return r.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (gate.isError) nav("/login");
  }, [gate.isError, nav]);

  async function logout() {
    await apiFetch("/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ scope: "ADMIN" }),
    });
    nav("/login");
  }

  if (gate.isPending) {
    return <div className="p-10 text-sm text-slate-600">Loading admin…</div>;
  }
  if (gate.isError) {
    return null;
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[220px_1fr]">
      <aside className="border-b border-slate-200 bg-white p-4 md:border-b-0 md:border-r">
        <div className="text-sm font-semibold text-slate-900">Nimbus Admin</div>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          {links.map(([label, href]) => (
            <Link key={href} className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100" to={href}>
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="mt-8 w-full rounded border border-slate-300 px-2 py-1 text-left text-sm text-slate-700 hover:bg-slate-50"
          type="button"
          onClick={() => void logout()}
        >
          Log out
        </button>
      </aside>
      <main className="bg-slate-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
