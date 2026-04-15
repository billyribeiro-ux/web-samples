import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

type ClerkUserEvt = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    public_metadata?: { role?: string };
  };
};

function roleFromClerk(meta: unknown): UserRole {
  const r =
    meta && typeof meta === "object" && "role" in meta
      ? String((meta as { role?: string }).role ?? "").toUpperCase()
      : "";
  if (r === "ADMIN") return UserRole.ADMIN;
  if (r === "EDITOR") return UserRole.EDITOR;
  if (r === "SUBSCRIBER") return UserRole.SUBSCRIBER;
  return UserRole.USER;
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET not configured", { status: 500 });
  }

  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(secret);
  let evt: ClerkUserEvt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvt;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const type = evt.type;
  const d = evt.data;

  if (type === "user.deleted") {
    await prisma.user.deleteMany({ where: { clerkId: d.id } });
    return new Response("ok", { status: 200 });
  }

  if (type === "user.created" || type === "user.updated") {
    const email =
      d.email_addresses?.[0]?.email_address ?? `user_${d.id}@placeholder.local`;
    const name = [d.first_name, d.last_name].filter(Boolean).join(" ") || null;
    const role = roleFromClerk(d.public_metadata);

    await prisma.user.upsert({
      where: { clerkId: d.id },
      create: {
        clerkId: d.id,
        email,
        name,
        image: d.image_url ?? null,
        role,
      },
      update: {
        email,
        name,
        image: d.image_url ?? null,
        role,
      },
    });
  }

  return new Response("ok", { status: 200 });
}
