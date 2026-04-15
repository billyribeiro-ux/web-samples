import { PostEditorForm } from "@/components/admin/post-editor-form";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <div className="mt-8 max-w-3xl">
        <PostEditorForm />
      </div>
    </div>
  );
}
