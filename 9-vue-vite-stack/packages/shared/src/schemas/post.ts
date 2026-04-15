import { z } from "zod";

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]);

export const adminPostCreateSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(2000).optional().nullable(),
  content: z.string().min(1),
  status: postStatusSchema,
  publishedAt: z.coerce.date().optional().nullable(),
  scheduledFor: z.coerce.date().optional().nullable(),
  readingMinutes: z.coerce.number().int().min(1).max(240).optional(),
  seoTitle: z.string().max(300).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  authorId: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  featuredImageId: z.string().optional().nullable(),
  ogImageId: z.string().optional().nullable(),
});

export const adminPostUpdateSchema = adminPostCreateSchema.partial();
