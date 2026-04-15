"use server";

import { prisma } from "@/lib/db";
import { assertPermission, PERMISSIONS } from "@/lib/permissions";
import { sanitizeHtml } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function upsertPost(formData: FormData) {
  await assertPermission(PERMISSIONS.CMS_POSTS);
  const id = formData.get("id")?.toString();
  const title = String(formData.get("title") ?? "");
  const slug = String(formData.get("slug") ?? "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  const excerpt = String(formData.get("excerpt") ?? "");
  const bodyHtml = sanitizeHtml(String(formData.get("bodyHtml") ?? ""));
  const status = String(formData.get("status") ?? "DRAFT") as
    | "DRAFT"
    | "SCHEDULED"
    | "PUBLISHED"
    | "ARCHIVED";

  const data = {
    title,
    slug,
    excerpt,
    bodyHtml,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    seoTitle: String(formData.get("seoTitle") ?? "") || null,
    seoDescription: String(formData.get("seoDescription") ?? "") || null,
  };

  if (id) {
    await prisma.post.update({ where: { id }, data });
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    redirect(`/admin/posts/${id}`);
  } else {
    const created = await prisma.post.create({ data });
    revalidatePath("/blog");
    redirect(`/admin/posts/${created.id}`);
  }
}
