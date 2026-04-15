import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../lib/api";

type Post = {
  id: string;
  slug: string;
  title: string;
  status: string;
};

export default function PostsPage() {
  const qc = useQueryClient();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("Draft body");

  const list = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const r = await apiFetch("/v1/admin/posts");
      const j = (await r.json()) as { posts: Post[] };
      return j.posts;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      await apiFetch("/v1/admin/posts", {
        method: "POST",
        body: JSON.stringify({
          slug,
          title,
          body,
          status: "DRAFT",
        }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  if (list.isPending) return <p>Loading…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Posts</h1>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Create draft</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input className="rounded border px-2 py-1 text-sm" placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <input className="rounded border px-2 py-1 text-sm" placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <textarea className="mt-2 w-full rounded border px-2 py-1 text-sm" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        <button
          className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
          type="button"
          disabled={!slug || !title || create.isPending}
          onClick={() => create.mutate()}
        >
          Create
        </button>
      </section>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2">Title</th>
            <th>Slug</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((p) => (
            <tr key={p.id} className="border-b border-slate-100">
              <td className="py-2 font-medium">{p.title}</td>
              <td>{p.slug}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
