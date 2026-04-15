import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { category: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft and published articles stored in Prisma.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">New post</Link>
        </Button>
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="font-medium hover:underline"
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.updatedAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
