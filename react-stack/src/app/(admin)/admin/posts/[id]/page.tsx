import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostEditorForm } from "@/components/admin/post-editor-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <div className="mt-8 max-w-3xl">
        <PostEditorForm post={post} />
      </div>
    </div>
  );
}
