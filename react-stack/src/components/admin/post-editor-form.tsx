"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Post } from "@prisma/client";
import { upsertPost } from "@/actions/admin-posts";

export function PostEditorForm({ post }: { post?: Post }) {
  return (
    <form action={upsertPost} className="space-y-4">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={post?.title}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={post?.slug}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <textarea
          id="excerpt"
          name="excerpt"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue={post?.excerpt ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bodyHtml">Body (HTML)</Label>
        <textarea
          id="bodyHtml"
          name="bodyHtml"
          className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-xs"
          defaultValue={post?.bodyHtml}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue={post?.status ?? "DRAFT"}
        >
          <option value="DRAFT">DRAFT</option>
          <option value="SCHEDULED">SCHEDULED</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input
            id="seoDescription"
            name="seoDescription"
            defaultValue={post?.seoDescription ?? ""}
          />
        </div>
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
