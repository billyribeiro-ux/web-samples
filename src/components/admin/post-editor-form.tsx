"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePostAction } from "@/app/actions/admin-posts";
import type { Author, Category, Post, Tag } from "@prisma/client";

type PostWithTags = Post & { tags: { tagId: string }[] };

export function PostEditorForm({
  authors,
  categories,
  allTags = [],
  post,
}: {
  authors: Author[];
  categories: Category[];
  allTags?: Tag[];
  post?: PostWithTags;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-8 max-w-2xl space-y-4"
      action={async (fd) => {
        setError(null);
        const res = await savePostAction(fd, post?.id);
        if (!res.ok) {
          setError(res.error ?? "Error");
          return;
        }
        router.push("/admin/posts");
        router.refresh();
      }}
    >
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
        <input
          name="title"
          required
          defaultValue={post?.title}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Slug</label>
        <input
          name="slug"
          required
          defaultValue={post?.slug}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Excerpt</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Body (HTML)</label>
        <textarea
          name="bodyHtml"
          required
          rows={12}
          defaultValue={post?.bodyHtml}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Author</label>
          <select
            name="authorId"
            required
            defaultValue={post?.authorId}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
          <select
            name="categoryId"
            defaultValue={post?.categoryId ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
        <select
          name="status"
          defaultValue={post?.status ?? "DRAFT"}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
      </div>
      {allTags.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {allTags.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="tagIds"
                  value={t.id}
                  defaultChecked={post?.tags.some((x) => x.tagId === t.id)}
                />
                {t.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950"
      >
        Save
      </button>
    </form>
  );
}
