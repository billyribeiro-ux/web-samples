"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function changePassword(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { error: "Password must be at least 8 characters." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user?.password) {
    return {
      error: "Password login is not set for this account.",
    };
  }

  const match = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password,
  );
  if (!match) {
    return { error: "Current password is incorrect." };
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  return { ok: true };
}
