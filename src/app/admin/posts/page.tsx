import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: true },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
        >
          New post
        </Link>
      </div>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="pb-3 font-medium text-zinc-500">Title</th>
            <th className="pb-3 font-medium text-zinc-500">Status</th>
            <th className="pb-3 font-medium text-zinc-500">Author</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/80">
              <td className="py-3">
                <Link href={`/admin/posts/${p.id}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-400">
                  {p.title}
                </Link>
              </td>
              <td className="py-3 text-zinc-600">{p.status}</td>
              <td className="py-3 text-zinc-600">{p.author.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
