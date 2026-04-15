"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  const name = String(formData.get("name") ?? "");
  const marketingEmails = formData.get("marketingEmails") === "on";
  const newsletterOptIn = formData.get("newsletterOptIn") === "on";
  const productUpdates = formData.get("productUpdates") === "on";

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { marketingEmails, newsletterOptIn, productUpdates },
    create: {
      userId: session.user.id,
      marketingEmails,
      newsletterOptIn,
      productUpdates,
    },
  });

  return { ok: true };
}
