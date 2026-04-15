"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function togglePostFavorite(postId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const existing = await prisma.userFavoritePost.findUnique({
    where: {
      userId_postId: { userId: session.user.id, postId },
    },
  });
  if (existing) {
    await prisma.userFavoritePost.delete({
      where: {
        userId_postId: { userId: session.user.id, postId },
      },
    });
  } else {
    await prisma.userFavoritePost.create({
      data: { userId: session.user.id, postId },
    });
  }
  revalidatePath("/account/favorites");
  return { ok: true };
}

export async function toggleProductFavorite(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  const existing = await prisma.userFavoriteProduct.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });
  if (existing) {
    await prisma.userFavoriteProduct.delete({
      where: {
        userId_productId: { userId: session.user.id, productId },
      },
    });
  } else {
    await prisma.userFavoriteProduct.create({
      data: { userId: session.user.id, productId },
    });
  }
  revalidatePath("/account/favorites");
  return { ok: true };
}
