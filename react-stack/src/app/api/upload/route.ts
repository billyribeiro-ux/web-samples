import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPresignedUploadUrl } from "@/lib/storage";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  if (!roles.some((r) => ["super_admin", "admin", "editor"].includes(r))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    contentType?: string;
    ext?: string;
  } | null;
  const contentType = body?.contentType ?? "application/octet-stream";
  const ext = body?.ext ?? "bin";
  const key = `uploads/${nanoid()}.${ext}`;

  const result = await getPresignedUploadUrl(key, contentType);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Storage not configured", reason: result.reason },
      { status: 501 },
    );
  }

  return NextResponse.json({ uploadUrl: result.url, publicUrl: result.publicUrl, key });
}
