import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const permKeys = [
    "admin.access",
    "posts.read",
    "posts.write",
    "pages.read",
    "pages.write",
    "products.read",
    "products.write",
    "orders.read",
    "users.read",
    "users.write",
    "settings.read",
    "settings.write",
    "media.write",
  ];

  const permissions = await Promise.all(
    permKeys.map((key) =>
      prisma.permission.upsert({
        where: { key },
        create: { key, description: key },
        update: {},
      })
    )
  );
  const permByKey = Object.fromEntries(permissions.map((p) => [p.key, p]));

  const superRole = await prisma.role.upsert({
    where: { name: "SUPERADMIN" },
    create: { name: "SUPERADMIN", description: "Full access" },
    update: {},
  });
  const editorRole = await prisma.role.upsert({
    where: { name: "EDITOR" },
    create: { name: "EDITOR", description: "Content editor" },
    update: {},
  });
  const customerRole = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    create: { name: "CUSTOMER", description: "Customer" },
    update: {},
  });

  for (const p of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superRole.id, permissionId: p.id } },
      create: { roleId: superRole.id, permissionId: p.id },
      update: {},
    });
  }
  for (const key of [
    "admin.access",
    "posts.read",
    "posts.write",
    "pages.read",
    "pages.write",
    "media.write",
    "products.read",
    "products.write",
    "orders.read",
    "settings.read",
    "settings.write",
    "users.read",
  ]) {
    const p = permByKey[key];
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: editorRole.id, permissionId: p.id } },
      create: { roleId: editorRole.id, permissionId: p.id },
      update: {},
    });
  }

  const hash = await argon2.hash("password123");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: {
      email: "admin@example.com",
      passwordHash: hash,
      name: "Admin User",
      emailVerified: true,
      roles: { create: { roleId: superRole.id } },
    },
    update: { passwordHash: hash },
    include: { roles: true },
  });

  if (!adminUser.roles.length) {
    await prisma.userRole.create({ data: { userId: adminUser.id, roleId: superRole.id } });
  }

  const editorUser = await prisma.user.upsert({
    where: { email: "editor@example.com" },
    create: {
      email: "editor@example.com",
      passwordHash: hash,
      name: "Editor User",
      emailVerified: true,
      roles: { create: { roleId: editorRole.id } },
    },
    update: { passwordHash: hash },
    include: { roles: true },
  });
  if (!editorUser.roles.length) {
    await prisma.userRole.create({ data: { userId: editorUser.id, roleId: editorRole.id } });
  }

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    create: {
      email: "customer@example.com",
      passwordHash: hash,
      name: "Customer User",
      emailVerified: true,
      roles: { create: { roleId: customerRole.id } },
    },
    update: { passwordHash: hash },
    include: { roles: true },
  });
  if (!customerUser.roles.length) {
    await prisma.userRole.create({ data: { userId: customerUser.id, roleId: customerRole.id } });
  }

  const author = await prisma.author.upsert({
    where: { slug: "platform-team" },
    create: { name: "Platform Team", slug: "platform-team", bio: "Editorial" },
    update: {},
  });

  const catGrowth = await prisma.category.upsert({
    where: { slug: "growth" },
    create: { name: "Growth", slug: "growth", description: "Marketing and growth" },
    update: {},
  });
  const catEng = await prisma.category.upsert({
    where: { slug: "engineering" },
    create: { name: "Engineering", slug: "engineering", description: "Build and ship" },
    update: {},
  });

  const tagSeo = await prisma.tag.upsert({
    where: { slug: "seo" },
    create: { name: "SEO", slug: "seo" },
    update: {},
  });
  const tagVue = await prisma.tag.upsert({
    where: { slug: "vue" },
    create: { name: "Vue", slug: "vue" },
    update: {},
  });

  const posts = [
    {
      slug: "technical-seo-checklist",
      title: "Technical SEO checklist for SPAs",
      excerpt: "Ship crawlable metadata, sitemaps, and performance discipline.",
      content: `<p>Modern SPAs can rank well when paired with a deliberate SEO layer: document titles, canonical URLs, structured data, and server-generated sitemaps.</p>`,
      status: "PUBLISHED" as const,
      readingMinutes: 8,
      seoTitle: "Technical SEO checklist",
      seoDescription: "SPA SEO foundations",
    },
    {
      slug: "vue-performance-notes",
      title: "Vue performance notes",
      excerpt: "Route-level code splitting and lazy media.",
      content: `<p>Split routes, defer non-critical work, and keep hydration costs predictable.</p>`,
      status: "PUBLISHED" as const,
      readingMinutes: 6,
    },
    {
      slug: "members-playbook",
      title: "Members-only content playbook",
      excerpt: "Gating, trials, and renewal moments.",
      content: `<p>Design clear value ladders and renewal reminders.</p>`,
      status: "PUBLISHED" as const,
      readingMinutes: 10,
    },
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      create: {
        ...p,
        publishedAt: new Date(),
        authorId: author.id,
        categories: {
          create: [{ categoryId: p.slug.includes("vue") ? catEng.id : catGrowth.id }],
        },
        tags: {
          create: [
            { tagId: p.slug.includes("seo") ? tagSeo.id : tagVue.id },
          ],
        },
      },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        status: p.status,
        readingMinutes: p.readingMinutes,
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
        publishedAt: new Date(),
      },
    });
  }

  const memberPost = await prisma.post.findUnique({ where: { slug: "members-playbook" } });
  if (memberPost) {
    await prisma.gatedContentRule.deleteMany({ where: { postId: memberPost.id } });
    await prisma.gatedContentRule.create({
      data: { postId: memberPost.id, planSlug: "pro" },
    });
  }

  const staticPages: { slug: string; title: string; content: string }[] = [
    {
      slug: "about",
      title: "About",
      content: `<p>We help teams ship credible, conversion-ready digital platforms.</p>`,
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `<p>We collect only what is needed to operate the service. Contact us for data requests.</p>`,
    },
    {
      slug: "terms",
      title: "Terms of Service",
      content: `<p>By using this demo you agree to evaluate the software responsibly.</p>`,
    },
    {
      slug: "cookies",
      title: "Cookie Policy",
      content: `<p>We use essential cookies for sessions and optional analytics hooks.</p>`,
    },
    {
      slug: "faq",
      title: "FAQ",
      content: `<h2>Billing</h2><p>Stripe Checkout powers carts and subscriptions in this demo.</p>`,
    },
  ];
  for (const pg of staticPages) {
    await prisma.page.upsert({
      where: { slug: pg.slug },
      create: { ...pg, published: true },
      update: { title: pg.title, content: pg.content, published: true },
    });
  }

  await prisma.plan.upsert({
    where: { slug: "free" },
    create: {
      name: "Free",
      slug: "free",
      description: "Get started",
      priceMonthlyCents: 0,
      priceYearlyCents: 0,
    },
    update: {},
  });
  await prisma.plan.upsert({
    where: { slug: "pro" },
    create: {
      name: "Pro",
      slug: "pro",
      description: "For growing teams",
      priceMonthlyCents: 2900,
      priceYearlyCents: 29000,
    },
    update: {},
  });

  const pcTemplates = await prisma.productCategory.upsert({
    where: { slug: "templates" },
    create: { name: "Templates", slug: "templates" },
    update: {},
  });

  await prisma.product.upsert({
    where: { slug: "starter-kit" },
    create: {
      slug: "starter-kit",
      name: "Starter Kit",
      description: "A polished marketing + member area starter you can extend.",
      priceCents: 9900,
      currency: "usd",
      type: "DIGITAL",
      published: true,
      categories: { create: [{ categoryId: pcTemplates.id }] },
    },
    update: {},
  });

  await prisma.navigationMenu.upsert({
    where: { key: "header" },
    create: {
      key: "header",
      name: "Header",
      items: {
        create: [
          { label: "Home", href: "/", sortOrder: 0 },
          { label: "About", href: "/about", sortOrder: 1 },
          { label: "Services", href: "/services", sortOrder: 2 },
          { label: "Pricing", href: "/pricing", sortOrder: 3 },
          { label: "Blog", href: "/blog", sortOrder: 4 },
          { label: "Contact", href: "/contact", sortOrder: 5 },
        ],
      },
    },
    update: {},
  });

  await prisma.navigationMenu.upsert({
    where: { key: "footer" },
    create: {
      key: "footer",
      name: "Footer",
      items: {
        create: [
          { label: "Privacy", href: "/privacy-policy", sortOrder: 0 },
          { label: "Terms", href: "/terms", sortOrder: 1 },
          { label: "Cookies", href: "/cookies", sortOrder: 2 },
        ],
      },
    },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: "brand" },
    create: {
      key: "brand",
      value: {
        siteName: "Apex Platform",
        tagline: "Marketing, memberships, and commerce—one stack.",
      },
    },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: "homepage" },
    create: {
      key: "homepage",
      value: {
        hero: {
          title: "Ship a serious digital business faster",
          subtitle:
            "Premium marketing site, SEO blog, memberships, subscriptions, and a real admin CMS—wired to PostgreSQL and Stripe-ready workflows.",
          primaryCta: { label: "View pricing", href: "/pricing" },
          secondaryCta: { label: "Read the blog", href: "/blog" },
        },
      },
    },
    update: {},
  });

  console.log("Seed complete. Demo logins (local only): admin@example.com / password123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
