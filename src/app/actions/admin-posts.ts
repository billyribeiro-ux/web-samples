"use server";

import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { buildSearchContent } from "@/lib/search";
import { requireAdminOrEditor } from "@/lib/auth";

export async function savePostAction(formData: FormData, id?: string) {
  await requireAdminOrEditor();

  const title = String(formData.get("title") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "") || null;
  const bodyHtml = String(formData.get("bodyHtml") ?? "");
  const authorId = String(formData.get("authorId") ?? "");
  const categoryIdRaw = String(formData.get("categoryId") ?? "");
  const categoryId = categoryIdRaw.length ? categoryIdRaw : null;
  const status = String(formData.get("status") ?? "DRAFT") as ContentStatus;
  const tagIds = formData.getAll("tagIds").map(String);

  const searchContent = buildSearchContent([title, excerpt, bodyHtml.replace(/<[^>]+>/g, " ")]);

  const data = {
    title,
    slug,
    excerpt,
    bodyHtml,
    authorId,
    categoryId,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
    scheduledFor: status === "SCHEDULED" ? new Date(Date.now() + 864e5) : null,
    searchContent,
    seoTitle: title,
    seoDescription: excerpt,
  };

  try {
    if (id) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      await prisma.post.update({ where: { id }, data });
      for (const tid of tagIds) {
        await prisma.postTag.create({ data: { postId: id, tagId: tid } });
      }
    } else {
      const post = await prisma.post.create({
        data: {
          ...data,
          readingMinutes: Math.max(1, Math.ceil(bodyHtml.length / 1200)),
        },
      });
      for (const tid of tagIds) {
        await prisma.postTag.create({ data: { postId: post.id, tagId: tid } });
      }
    }
    revalidatePath("/blog");
    revalidatePath("/admin/posts");
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { ok: false as const, error: "Could not save (duplicate slug?)" };
  }
}
