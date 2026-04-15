import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(8000),
  website: z.string().max(0).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
  website: z.string().max(0).optional(),
});
