import { z } from "zod";

export const adminPageUpsertSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(300),
  content: z.string(),
  blocks: z.unknown().optional().nullable(),
  published: z.boolean().optional(),
  seoTitle: z.string().max(300).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  ogImageId: z.string().optional().nullable(),
});
