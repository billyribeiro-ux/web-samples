import { prisma } from "@/lib/db";
import { PostEditorForm } from "@/components/admin/post-editor-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const authors = await prisma.author.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">New post</h1>
      <PostEditorForm authors={authors} categories={categories} />
    </div>
  );
}
