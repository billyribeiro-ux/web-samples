import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  message: z.string().min(10).max(5000),
  _hp: z.string().max(0).optional(),
});

export const newsletterSchema = z.object({
  email: z.email(),
  source: z.string().max(120).optional(),
});
