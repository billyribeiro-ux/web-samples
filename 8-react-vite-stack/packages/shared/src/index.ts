import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const contactFormSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().min(1).max(300),
  message: z.string().min(1).max(10000),
});

export const newsletterFormSchema = z.object({
  email: z.string().email(),
  source: z.string().max(100).optional(),
});

export const leadFormSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  interest: z.string().max(200).optional(),
  message: z.string().max(5000).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type NewsletterFormInput = z.infer<typeof newsletterFormSchema>;
export type LeadFormInput = z.infer<typeof leadFormSchema>;
