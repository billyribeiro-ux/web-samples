import { PrismaClient, ContentStatus, LeadType, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password", 12);

  const permissions = [
    { key: "admin:access", description: "Access admin area" },
    { key: "cms:posts", description: "Manage blog posts" },
    { key: "cms:pages", description: "Manage pages" },
    { key: "cms:media", description: "Manage media" },
    { key: "commerce:manage", description: "Products and orders" },
    { key: "users:manage", description: "Users and roles" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
  }

  const roles = [
    {
      key: "super_admin",
      name: "Super Admin",
      perms: permissions.map((x) => x.key),
    },
    {
      key: "admin",
      name: "Admin",
      perms: [
        "admin:access",
        "cms:posts",
        "cms:pages",
        "cms:media",
        "commerce:manage",
        "users:manage",
      ],
    },
    {
      key: "editor",
      name: "Editor",
      perms: ["admin:access", "cms:posts", "cms:pages", "cms:media"],
    },
    { key: "member", name: "Member", perms: [] },
    { key: "user", name: "User", perms: [] },
  ];

  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name },
      create: { key: r.key, name: r.name },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const pk of r.perms) {
      const perm = await prisma.permission.findUnique({ where: { key: pk } });
      if (perm) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  const superRole = await prisma.role.findUniqueOrThrow({
    where: { key: "super_admin" },
  });
  const memberRole = await prisma.role.findUniqueOrThrow({
    where: { key: "member" },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: passwordHash },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: passwordHash,
      emailVerified: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: adminUser.id, roleId: superRole.id },
    },
    update: {},
    create: { userId: adminUser.id, roleId: superRole.id },
  });

  const demoMember = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: { password: passwordHash },
    create: {
      email: "member@example.com",
      name: "Demo Member",
      password: passwordHash,
      emailVerified: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: demoMember.id, roleId: memberRole.id },
    },
    update: {},
    create: { userId: demoMember.id, roleId: memberRole.id },
  });

  await prisma.userSettings.upsert({
    where: { userId: demoMember.id },
    update: {},
    create: {
      userId: demoMember.id,
      newsletterOptIn: true,
      marketingEmails: false,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      slug: "free",
      name: "Free",
      description: "Get started",
      isDefaultFree: true,
      monthlyAmountCents: 0,
      yearlyAmountCents: 0,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      slug: "pro",
      name: "Pro",
      description: "Full access",
      monthlyAmountCents: 2900,
      yearlyAmountCents: 29000,
      stripePriceMonthlyId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "price_demo_monthly",
      stripePriceYearlyId: process.env.STRIPE_PRICE_PRO_YEARLY ?? "price_demo_yearly",
      featuresJson: JSON.stringify(["Members library", "Priority support"]),
      trialDays: 14,
    },
  });

  const cat = await prisma.category.upsert({
    where: { slug: "insights" },
    update: {},
    create: {
      slug: "insights",
      name: "Insights",
      description: "Product and growth notes",
    },
  });

  const author = await prisma.author.upsert({
    where: { slug: "team" },
    update: {},
    create: {
      slug: "team",
      name: "Platform Team",
      bio: "We build thoughtful software for modern businesses.",
    },
  });

  const tag1 = await prisma.tag.upsert({
    where: { slug: "seo" },
    update: {},
    create: { slug: "seo", name: "SEO" },
  });

  const welcomePost = await prisma.post.upsert({
    where: { slug: "welcome-to-our-blog" },
    update: {},
    create: {
      slug: "welcome-to-our-blog",
      title: "Welcome to our blog",
      excerpt: "How we think about content, conversion, and clarity.",
      bodyHtml:
        "<p>This is a <strong>demo post</strong> seeded from Prisma. Rich text is stored as sanitized HTML.</p><p>Replace the CMS content with your own narrative.</p>",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 4,
      categoryId: cat.id,
      authorId: author.id,
      seoTitle: "Welcome to our blog",
      seoDescription: "A demo article for the business platform starter.",
    },
  });

  await prisma.postTag.upsert({
    where: {
      postId_tagId: { postId: welcomePost.id, tagId: tag1.id },
    },
    update: {},
    create: { postId: welcomePost.id, tagId: tag1.id },
  });

  await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      title: "Homepage",
      excerpt: "Hero and sections driven by CMS settings in production.",
      bodyHtml: "<p>Homepage body managed via <code>SiteSetting</code> in this demo.</p>",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      seoTitle: "Business Platform",
      seoDescription: "Marketing, memberships, and commerce in one Next.js app.",
    },
  });

  const pc = await prisma.productCategory.upsert({
    where: { slug: "templates" },
    update: {},
    create: {
      slug: "templates",
      name: "Templates",
      description: "Starter kits",
    },
  });

  await prisma.product.upsert({
    where: { slug: "playbook-pdf" },
    update: {},
    create: {
      slug: "playbook-pdf",
      name: "Growth Playbook (PDF)",
      description: "A digital download demonstrating ecommerce + fulfillment hooks.",
      status: ContentStatus.PUBLISHED,
      type: ProductType.DIGITAL,
      priceCents: 1900,
      categoryId: pc.id,
      stripePriceId: process.env.STRIPE_PRICE_PRODUCT_DEMO ?? "price_product_demo",
    },
  });

  await prisma.navigationMenu.upsert({
    where: { key: "main" },
    update: {},
    create: {
      key: "main",
      label: "Main",
      itemsJson: JSON.stringify([
        { href: "/about", label: "About" },
        { href: "/services", label: "Services" },
        { href: "/pricing", label: "Pricing" },
        { href: "/blog", label: "Blog" },
        { href: "/contact", label: "Contact" },
      ]),
    },
  });

  const settings = [
    { key: "brand_name", valueJson: JSON.stringify("Apex Platform") },
    {
      key: "footer_columns",
      valueJson: JSON.stringify([
        {
          title: "Product",
          links: [
            { href: "/pricing", label: "Pricing" },
            { href: "/services", label: "Services" },
          ],
        },
        {
          title: "Company",
          links: [
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
          ],
        },
        {
          title: "Legal",
          links: [
            { href: "/privacy-policy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ],
        },
      ]),
    },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { valueJson: s.valueJson },
      create: { key: s.key, valueJson: s.valueJson },
    });
  }

  await prisma.gatedContentRule.deleteMany({
    where: { routePath: "/members" },
  });
  await prisma.gatedContentRule.create({
    data: {
      targetType: "ROUTE",
      routePath: "/members",
      requireActiveSubscription: true,
      planSlug: "pro",
    },
  });

  await prisma.formSubmission.create({
    data: {
      type: LeadType.CONTACT,
      email: "lead@example.com",
      name: "Sample Lead",
      payloadJson: JSON.stringify({ message: "Demo submission" }),
    },
  });

  console.log("Seed complete. Login: admin@example.com / password");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
