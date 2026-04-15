import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useApi } from '@/hooks/useApi.js';

type Post = { id: string; slug: string; title: string; status: string };

export function AdminPostsPage() {
  const api = useApi();
  const [items, setItems] = useState<Post[]>([]);

  useEffect(() => {
    void api<{ items: Post[] }>('/api/admin/posts').then((d) => setItems(d.items));
  }, [api]);

  return (
    <>
      <Helmet>
        <title>Admin — Posts</title>
      </Helmet>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link to="/blog" className="text-sm text-sky-700 no-underline">
          View site
        </Link>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            <th className="py-2">Title</th>
            <th className="py-2">Slug</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-b border-slate-100">
              <td className="py-2 font-medium">{p.title}</td>
              <td className="py-2 text-slate-600">{p.slug}</td>
              <td className="py-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
