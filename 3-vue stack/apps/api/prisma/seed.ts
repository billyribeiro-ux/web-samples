import { PrismaClient, ContentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const perms = [
    { slug: "admin:full", label: "Full admin" },
    { slug: "content:read", label: "Read content" },
    { slug: "content:write", label: "Write content" },
    { slug: "orders:read", label: "Read orders" },
    { slug: "users:read", label: "Read users" },
    { slug: "users:write", label: "Write users" },
    { slug: "settings:write", label: "Site settings" },
  ];
  for (const p of perms) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      create: p,
      update: { label: p.label },
    });
  }

  const superAdminRole = await prisma.role.upsert({
    where: { slug: "super-admin" },
    create: { name: "Super Admin", slug: "super-admin", description: "Full access" },
    update: {},
  });
  const editorRole = await prisma.role.upsert({
    where: { slug: "editor" },
    create: { name: "Editor", slug: "editor", description: "Content" },
    update: {},
  });
  const memberRole = await prisma.role.upsert({
    where: { slug: "member" },
    create: { name: "Member", slug: "member", description: "Registered user" },
    update: {},
  });

  const allPermIds = await prisma.permission.findMany();
  for (const perm of allPermIds) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id },
      },
      create: { roleId: superAdminRole.id, permissionId: perm.id },
      update: {},
    });
  }
  const editorPerms = await prisma.permission.findMany({
    where: { slug: { in: ["content:read", "content:write"] } },
  });
  for (const perm of editorPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: editorRole.id, permissionId: perm.id },
      },
      create: { roleId: editorRole.id, permissionId: perm.id },
      update: {},
    });
  }

  const hash = await bcrypt.hash("Testpass123!", 12);

  let adminUser = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        passwordHash: hash,
        name: "Admin User",
        emailVerified: true,
        roles: { create: { roleId: superAdminRole.id } },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash: hash },
    });
  }

  const existingMember = await prisma.user.findUnique({ where: { email: "member@example.com" } });
  if (!existingMember) {
    await prisma.user.create({
      data: {
        email: "member@example.com",
        passwordHash: hash,
        name: "Member User",
        emailVerified: true,
        roles: { create: { roleId: memberRole.id } },
      },
    });
  }

  await prisma.plan.upsert({
    where: { slug: "free" },
    create: {
      slug: "free",
      name: "Free",
      description: "Get started",
      stripePriceId: "price_free_placeholder",
      amountCents: 0,
      interval: "month",
      isDefaultFree: true,
    },
    update: {},
  });
  await prisma.plan.upsert({
    where: { slug: "pro" },
    create: {
      slug: "pro",
      name: "Pro",
      description: "Full access",
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? "price_pro_placeholder",
      stripeProductId: process.env.STRIPE_PRO_PRODUCT_ID ?? "prod_pro_placeholder",
      amountCents: 4900,
      interval: "month",
    },
    update: {},
  });

  const author = await prisma.author.upsert({
    where: { slug: "team" },
    create: { name: "Platform Team", slug: "team", bio: "We build thoughtful products." },
    update: {},
  });

  const cat = await prisma.category.upsert({
    where: { slug: "product" },
    create: { name: "Product", slug: "product", description: "Product updates" },
    update: {},
  });
  await prisma.tag.upsert({
    where: { slug: "launch" },
    create: { name: "Launch", slug: "launch" },
    update: {},
  });

  await prisma.post.upsert({
    where: { slug: "welcome-to-the-platform" },
    create: {
      slug: "welcome-to-the-platform",
      title: "Welcome to the platform",
      excerpt: "What we are building and why it matters.",
      body: "<p>This is a production-style content model with SEO fields, categories, and rich text.</p>",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 4,
      authorId: author.id,
      seoTitle: "Welcome — Platform Blog",
      seoDescription: "Introduction to our platform and roadmap.",
    },
    update: {},
  });

  await prisma.page.upsert({
    where: { slug: "about" },
    create: {
      slug: "about",
      title: "About us",
      body: "<p>We help modern businesses ship credible digital experiences.</p>",
      status: ContentStatus.PUBLISHED,
      seoTitle: "About",
      seoDescription: "Learn about our mission and team.",
    },
    update: {},
  });

  const pcat = await prisma.productCategory.upsert({
    where: { slug: "templates" },
    create: { name: "Templates", slug: "templates", description: "Starter kits" },
    update: {},
  });

  let product = await prisma.product.findUnique({ where: { slug: "starter-kit" } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        slug: "starter-kit",
        name: "Business Starter Kit",
        description: "Curated assets and checklist for launching your site.",
        priceCents: 9900,
        status: ContentStatus.PUBLISHED,
        fulfillment: "DIGITAL",
        categories: { create: [{ categoryId: pcat.id }] },
      },
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "site.name" },
    create: { key: "site.name", value: "Apex Platform" },
    update: { value: "Apex Platform" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "site.tagline" },
    create: { key: "site.tagline", value: "Launch faster. Convert better." },
    update: {},
  });

  await prisma.navigationMenu.upsert({
    where: { slug: "header" },
    create: {
      slug: "header",
      label: "Header",
      items: [
        { label: "Home", to: "/" },
        { label: "Services", to: "/services" },
        { label: "Pricing", to: "/pricing" },
        { label: "Blog", to: "/blog" },
        { label: "Contact", to: "/contact" },
      ],
    },
    update: {},
  });

  await prisma.gatedContentRule.upsert({
    where: { path: "/members" },
    create: {
      path: "/members",
      requireSubscription: true,
      minPlanSlug: "pro",
    },
    update: {},
  });

  await prisma.discount.upsert({
    where: { code: "LAUNCH10" },
    create: {
      code: "LAUNCH10",
      percentOff: 10,
      active: true,
    },
    update: { percentOff: 10, active: true },
  });

  console.log("Seed complete. Admin: admin@example.com / Password: Testpass123!");
  console.log("Member: member@example.com / Password: Testpass123!");
  console.log("Sample product:", product.slug);
  console.log("Blog category:", cat.slug);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
