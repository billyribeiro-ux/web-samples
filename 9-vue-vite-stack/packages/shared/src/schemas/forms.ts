import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(10000),
  company: z.string().max(120).optional(),
  website: z.string().max(200).optional(), // honeypot — should be empty
});

export const newsletterFormSchema = z.object({
  email: z.string().email(),
  source: z.string().max(120).optional(),
  website: z.string().max(200).optional(),
});
