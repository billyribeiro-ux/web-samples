"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function submitContactAction(input: z.infer<typeof contactSchema>) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = checkRateLimit(`contact:${ip}`, 20, 60 * 60 * 1000);
  if (!rl.ok) {
    return { ok: false as const, error: "Too many submissions. Try again later." };
  }

  await prisma.formSubmission.create({
    data: {
      type: "contact",
      email: parsed.data.email,
      payload: parsed.data as object,
      ip,
      userAgent: h.get("user-agent") ?? null,
    },
  });

  await sendTransactionalEmail({
    to: process.env.CONTACT_INBOX_EMAIL ?? parsed.data.email,
    subject: `Contact form: ${parsed.data.name}`,
    text: `${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
  });

  return { ok: true as const };
}

const newsletterSchema = z.object({
  email: z.string().email(),
});

export async function subscribeNewsletterAction(input: z.infer<typeof newsletterSchema>) {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid email" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = checkRateLimit(`newsletter:${ip}`, 30, 60 * 60 * 1000);
  if (!rl.ok) return { ok: false as const, error: "Too many attempts." };

  await prisma.newsletterLead.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email, source: "footer" },
    update: {},
  });

  await prisma.formSubmission.create({
    data: {
      type: "newsletter",
      email: parsed.data.email,
      payload: { email: parsed.data.email },
      ip,
    },
  });

  return { ok: true as const };
}
