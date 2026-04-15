"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { LeadType } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import crypto from "crypto";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(10),
  website: z.string().optional(),
});

export async function submitContact(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const hp = formData.get("company");
  if (hp) return { ok: true };

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website"),
  });
  if (!parsed.success) {
    return { error: "Please check the form fields." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`contact:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return { error: "Too many requests. Try again shortly." };
  }

  await prisma.formSubmission.create({
    data: {
      type: LeadType.CONTACT,
      name: parsed.data.name,
      email: parsed.data.email,
      body: parsed.data.message,
      payloadJson: JSON.stringify({ website: parsed.data.website }),
      ipHash: crypto.createHash("sha256").update(ip).digest("hex"),
      userAgent: h.get("user-agent") ?? undefined,
    },
  });

  return { ok: true };
}

const newsletterSchema = z.object({
  email: z.string().email(),
});

export async function subscribeNewsletter(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: "Invalid email" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`newsletter:${ip}`, 10, 60_000);
  if (!rl.ok) return { error: "Too many requests." };

  await prisma.newsletterLead.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: {},
    create: {
      email: parsed.data.email.toLowerCase(),
      source: "footer",
    },
  });

  await prisma.formSubmission.create({
    data: {
      type: LeadType.NEWSLETTER,
      email: parsed.data.email.toLowerCase(),
      payloadJson: JSON.stringify({ source: "footer" }),
      ipHash: crypto.createHash("sha256").update(ip).digest("hex"),
    },
  });

  return { ok: true };
}
