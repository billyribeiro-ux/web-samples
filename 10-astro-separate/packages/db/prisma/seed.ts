import { PrismaClient, PostStatus, PageStatus, ProductStatus, ProductType } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const password = await argon2.hash("password123");

  const permissions = await Promise.all(
    [
      "admin.dashboard",
      "admin.pages",
      "admin.posts",
      "admin.categories",
      "admin.tags",
      "admin.media",
      "admin.users",
      "admin.roles",
      "admin.products",
      "admin.orders",
      "admin.subscriptions",
      "admin.forms",
      "admin.navigation",
      "admin.settings",
      "admin.seo",
    ].map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key },
      })
    )
  );

  const allPermIds = permissions.map((p) => ({ permissionId: p.id }));

  const superAdminRole = await prisma.role.upsert({
    where: { name: "super_admin" },
    update: {},
    create: {
      name: "super_admin",
      description: "Full platform access",
      permissions: {
        create: allPermIds,
      },
    },
    include: { permissions: true },
  });

  if (superAdminRole.permissions.length === 0) {
    await prisma.rolePermission.createMany({
      data: permissions.map((p) => ({ roleId: superAdminRole.id, permissionId: p.id })),
      skipDuplicates: true,
    });
  }

  const editorRole = await prisma.role.upsert({
    where: { name: "editor" },
    update: {},
    create: {
      name: "editor",
      description: "Content publishing",
      permissions: {
        create: permissions
          .filter((p) =>
            [
              "admin.dashboard",
              "admin.pages",
              "admin.posts",
              "admin.categories",
              "admin.tags",
              "admin.media",
              "admin.navigation",
              "admin.seo",
            ].includes(p.key)
          )
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const memberRole = await prisma.role.upsert({
    where: { name: "member" },
    update: {},
    create: { name: "member", description: "Registered member" },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: "customer" },
    update: {},
    create: { name: "customer", description: "Store customer" },
  });

  const superUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: password },
    create: {
      email: "admin@example.com",
      passwordHash: password,
      name: "Super Admin",
      emailVerifiedAt: new Date(),
      roles: { create: { roleId: superAdminRole.id } },
    },
  });

  await prisma.user.upsert({
    where: { email: "editor@example.com" },
    update: { passwordHash: password },
    create: {
      email: "editor@example.com",
      passwordHash: password,
      name: "Editor User",
      emailVerifiedAt: new Date(),
      roles: { create: { roleId: editorRole.id } },
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: { passwordHash: password },
    create: {
      email: "member@example.com",
      passwordHash: password,
      name: "Member User",
      emailVerifiedAt: new Date(),
      roles: { create: { roleId: memberRole.id } },
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { passwordHash: password },
    create: {
      email: "customer@example.com",
      passwordHash: password,
      name: "Customer User",
      emailVerifiedAt: new Date(),
      roles: { create: { roleId: customerRole.id } },
    },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: memberUser.id },
    update: {},
    create: { userId: memberUser.id },
  });

  const freePlan = await prisma.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free",
      slug: "free",
      description: "Get started",
      amountMonthlyCents: 0,
      amountYearlyCents: 0,
      features: ["Community access"],
    },
  });

  await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      description: "Full access",
      amountMonthlyCents: 2900,
      amountYearlyCents: 29000,
      stripePriceIdMonthly: "price_pro_monthly_placeholder",
      stripePriceIdYearly: "price_pro_yearly_placeholder",
      features: ["Members library", "Priority support", "Downloads"],
    },
  });

  await prisma.subscription.upsert({
    where: { id: "seed-sub-member" },
    update: {},
    create: {
      id: "seed-sub-member",
      userId: memberUser.id,
      planId: freePlan.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 86400000 * 30),
    },
  });

  const catGrowth = await prisma.category.upsert({
    where: { slug: "growth" },
    update: {},
    create: { name: "Growth", slug: "growth", description: "Marketing and growth" },
  });

  const catEngineering = await prisma.category.upsert({
    where: { slug: "engineering" },
    update: {},
    create: { name: "Engineering", slug: "engineering", description: "Technical deep dives" },
  });

  const tagSeo = await prisma.tag.upsert({
    where: { slug: "seo" },
    update: {},
    create: { name: "SEO", slug: "seo" },
  });

  const tagProduct = await prisma.tag.upsert({
    where: { slug: "product" },
    update: {},
    create: { name: "Product", slug: "product" },
  });

  const author = await prisma.author.upsert({
    where: { slug: "alex-rivera" },
    update: {},
    create: {
      name: "Alex Rivera",
      slug: "alex-rivera",
      bio: "Principal engineer writing about platforms and growth.",
    },
  });

  const posts = [
    {
      slug: "building-credible-digital-presence",
      title: "Building a credible digital presence",
      excerpt: "What separates premium business sites from template noise.",
      body: "## Start with outcomes\n\nShip fewer pages, but make each one excellent.\n\n## Measure\n\nInstrument conversions early.",
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 6,
      authorId: author.id,
      categories: {
        create: [{ category: { connect: { id: catGrowth.id } } }],
      },
      tags: {
        create: [{ tag: { connect: { id: tagProduct.id } } }],
      },
    },
    {
      slug: "seo-architecture-for-modern-apps",
      title: "SEO architecture for modern apps",
      excerpt: "Server rendering, metadata, and structured data done deliberately.",
      body: "## Rendering\n\nPrefer SSR for indexable surfaces.\n\n## Metadata\n\nCanonical URLs and Open Graph should be first-class fields.",
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 86400000 * 2),
      readingMinutes: 8,
      authorId: author.id,
      categories: {
        create: [{ category: { connect: { id: catEngineering.id } } }],
      },
      tags: {
        create: [{ tag: { connect: { id: tagSeo.id } } }],
      },
    },
    {
      slug: "draft-post-example",
      title: "Draft: upcoming launch checklist",
      excerpt: "Not published yet.",
      body: "This is a draft post for CMS workflow demos.",
      status: PostStatus.DRAFT,
      authorId: author.id,
    },
  ] as const;

  for (const p of posts) {
    await prisma.post.deleteMany({ where: { slug: p.slug } });
    await prisma.post.create({ data: p });
  }

  await prisma.product.deleteMany({ where: { slug: "playbook-digital-strategy" } });
  await prisma.product.create({
    data: {
      name: "Digital Strategy Playbook",
      slug: "playbook-digital-strategy",
      description: "A practical guide for teams shipping premium web experiences.",
      body: "## Contents\n\nPositioning, IA, conversion, analytics readiness.",
      priceCents: 4900,
      type: ProductType.DIGITAL,
      status: ProductStatus.ACTIVE,
      categories: {
        create: [{ category: { connect: { id: catGrowth.id } } }],
      },
      tags: {
        create: [{ tag: { connect: { id: tagProduct.id } } }],
      },
    },
  });

  await prisma.product.deleteMany({ where: { slug: "office-hours-pack" } });
  await prisma.product.create({
    data: {
      name: "Office Hours Pack (5 sessions)",
      slug: "office-hours-pack",
      description: "Five 45-minute working sessions with our team.",
      priceCents: 15000,
      type: ProductType.SERVICE,
      status: ProductStatus.ACTIVE,
    },
  });

  const pages = [
    { slug: "about", title: "About", body: "# About\n\nWe build serious digital platforms.", status: PageStatus.PUBLISHED, publishedAt: new Date() },
    { slug: "faq", title: "FAQ", body: "# FAQ\n\n**What is this?** A production-minded sample platform.", status: PageStatus.PUBLISHED, publishedAt: new Date() },
  ] as const;

  for (const pg of pages) {
    await prisma.page.upsert({
      where: { slug: pg.slug },
      update: {},
      create: pg,
    });
  }

  await prisma.promoCode.upsert({
    where: { code: "LAUNCH10" },
    update: {},
    create: { code: "LAUNCH10", percentOff: 10, active: true },
  });

  const header = await prisma.navigationMenu.upsert({
    where: { name: "HEADER" },
    update: {},
    create: { name: "HEADER" },
  });

  await prisma.navigationItem.deleteMany({ where: { menuId: header.id } });
  const headerItems = [
    { label: "Services", href: "/services", sortOrder: 0 },
    { label: "Pricing", href: "/pricing", sortOrder: 1 },
    { label: "Blog", href: "/blog", sortOrder: 2 },
    { label: "Contact", href: "/contact", sortOrder: 3 },
  ];
  for (const item of headerItems) {
    await prisma.navigationItem.create({ data: { ...item, menuId: header.id } });
  }

  const footer = await prisma.navigationMenu.upsert({
    where: { name: "FOOTER" },
    update: {},
    create: { name: "FOOTER" },
  });
  await prisma.navigationItem.deleteMany({ where: { menuId: footer.id } });
  const footerItems = [
    { label: "Privacy", href: "/privacy-policy", sortOrder: 0 },
    { label: "Terms", href: "/terms", sortOrder: 1 },
    { label: "Cookies", href: "/cookies", sortOrder: 2 },
  ];
  for (const item of footerItems) {
    await prisma.navigationItem.create({ data: { ...item, menuId: footer.id } });
  }

  await prisma.siteSetting.upsert({
    where: { key: "brand" },
    update: {
      value: {
        siteName: "Nimbus Platform",
        tagline: "Premium web experiences, engineered end-to-end.",
        primaryCtaLabel: "Book a demo",
        primaryCtaHref: "/contact",
      },
    },
    create: {
      key: "brand",
      value: {
        siteName: "Nimbus Platform",
        tagline: "Premium web experiences, engineered end-to-end.",
        primaryCtaLabel: "Book a demo",
        primaryCtaHref: "/contact",
      },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "homepage" },
    update: {},
    create: {
      key: "homepage",
      value: {
        heroTitle: "Ship a credible business platform faster",
        heroSubtitle:
          "Marketing, memberships, commerce, and publishing — built with the same serious engineering standards you would expect in production.",
        heroSecondaryCta: { label: "View pricing", href: "/pricing" },
      },
    },
  });

  await prisma.gatedContentRule.upsert({
    where: { slug: "members/welcome" },
    update: {},
    create: {
      slug: "members/welcome",
      title: "Welcome to the member library",
      body: "This content is gated behind an active subscription in production. Here it is visible for demo accounts with membership.",
      minPlanSlug: "free",
      requiresSubscription: true,
    },
  });

  // Ensure super user has super admin role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superUser.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superUser.id, roleId: superAdminRole.id },
  });

  console.log("Seed complete. Users: admin@example.com, editor@example.com, member@example.com, customer@example.com — password: password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
