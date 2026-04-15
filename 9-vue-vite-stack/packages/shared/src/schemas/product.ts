import { z } from "zod";

export const adminProductUpsertSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(300),
  description: z.string().min(1),
  priceCents: z.coerce.number().int().min(0),
  currency: z.string().length(3).default("usd"),
  type: z.enum(["DIGITAL", "SERVICE"]).default("DIGITAL"),
  published: z.boolean().optional(),
  featuredImageId: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).optional(),
});
