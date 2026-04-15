import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostEditorForm } from "@/components/admin/post-editor-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: true },
  });
  if (!post) notFound();

  const authors = await prisma.author.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit post</h1>
      <PostEditorForm
        authors={authors}
        categories={categories}
        allTags={allTags}
        post={post}
      />
    </div>
  );
}
