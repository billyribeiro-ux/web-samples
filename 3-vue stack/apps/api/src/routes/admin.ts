import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requirePermission, requireUser } from "../middleware/auth.js";

export function adminRouter() {
  const r = Router();

  r.get("/dashboard", requireUser, requirePermission("content:write"), async (_req, res) => {
    const [
      posts,
      pages,
      products,
      orders,
      users,
      submissions,
      leads,
    ] = await prisma.$transaction([
      prisma.post.count(),
      prisma.page.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.formSubmission.count(),
      prisma.newsletterLead.count(),
    ]);
    res.json({
      counts: { posts, pages, products, orders, users, submissions, leads },
    });
  });

  r.get("/users", requireUser, requirePermission("users:read"), async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};
    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { roles: { include: { role: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    res.json({ total, page, pageSize, items });
  });

  r.get("/orders", requireUser, requirePermission("orders:read"), async (_req, res) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { items: { include: { product: true } } },
    });
    res.json({ items: orders });
  });

  r.get("/form-submissions", requireUser, requirePermission("orders:read"), async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const [total, items] = await prisma.$transaction([
      prisma.formSubmission.count(),
      prisma.formSubmission.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    res.json({ total, page, pageSize, items });
  });

  return r;
}
