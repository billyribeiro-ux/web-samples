import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Router } from "express";
import { randomToken } from "../lib/tokens.js";
import { prisma } from "../lib/prisma.js";
import { requirePermission, requireUser } from "../middleware/auth.js";
import type { Env } from "../config.js";

export function mediaRouter(env: Env) {
  const r = Router();

  function s3(): { client: S3Client; bucket: string; publicUrl: string } | null {
    if (
      !env.S3_BUCKET ||
      !env.S3_ACCESS_KEY_ID ||
      !env.S3_SECRET_ACCESS_KEY ||
      !env.S3_PUBLIC_URL
    ) {
      return null;
    }
    const client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: Boolean(env.S3_ENDPOINT),
    });
    return { client, bucket: env.S3_BUCKET, publicUrl: env.S3_PUBLIC_URL.replace(/\/$/, "") };
  }

  r.post("/presign", requireUser, requirePermission("content:write"), async (req, res) => {
    const store = s3();
    const body = req.body as { mimeType?: string; filename?: string };
    if (!store || !body.mimeType) {
      res.status(503).json({ error: "Object storage not configured" });
      return;
    }
    const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomToken(16)}-${body.filename ?? "file"}`;
    const cmd = new PutObjectCommand({
      Bucket: store.bucket,
      Key: key,
      ContentType: body.mimeType,
    });
    const uploadUrl = await getSignedUrl(store.client, cmd, { expiresIn: 3600 });
    const url = `${store.publicUrl}/${key}`;
    res.json({ uploadUrl, key, url });
  });

  r.post("/commit", requireUser, requirePermission("content:write"), async (req, res) => {
    const body = req.body as {
      key: string;
      url: string;
      mimeType: string;
      sizeBytes: number;
      alt?: string;
      title?: string;
    };
    const asset = await prisma.mediaAsset.create({
      data: {
        key: body.key,
        url: body.url,
        mimeType: body.mimeType,
        sizeBytes: body.sizeBytes,
        alt: body.alt ?? null,
        title: body.title ?? null,
      },
    });
    res.status(201).json(asset);
  });

  r.get("/", requireUser, requirePermission("content:write"), async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 24));
    const [total, items] = await prisma.$transaction([
      prisma.mediaAsset.count(),
      prisma.mediaAsset.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    res.json({ total, page, pageSize, items });
  });

  return r;
}
