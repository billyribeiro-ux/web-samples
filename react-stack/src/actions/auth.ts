"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Invalid input" };
  }
  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { error: "Email already registered" };
  }
  const password = await bcrypt.hash(parsed.data.password, 12);
  const userRole = await prisma.role.findUnique({ where: { key: "user" } });
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      password,
    },
  });
  if (userRole) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: userRole.id },
    });
  }
  await prisma.userSettings.create({
    data: { userId: user.id },
  });
  return { ok: true };
}

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function forgotPasswordAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Invalid email" };
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: true };
  }
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await prisma.passwordResetToken.deleteMany({ where: { email } });
  await prisma.passwordResetToken.create({
    data: {
      email,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${base}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, url);
  return { ok: true };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function resetPasswordAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Invalid input" };
  const tokenHash = crypto
    .createHash("sha256")
    .update(parsed.data.token)
    .digest("hex");
  const row = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
  });
  if (!row) return { error: "Invalid or expired token" };
  const password = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { email: row.email },
    data: { password },
  });
  await prisma.passwordResetToken.deleteMany({ where: { email: row.email } });
  return { ok: true };
}
