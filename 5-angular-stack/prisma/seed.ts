import { PrismaClient, ContentStatus, FormType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { slug: 'content:read' },
      update: {},
      create: { slug: 'content:read', description: 'Read content' },
    }),
    prisma.permission.upsert({
      where: { slug: 'content:write' },
      update: {},
      create: { slug: 'content:write', description: 'Write content' },
    }),
    prisma.permission.upsert({
      where: { slug: 'admin:access' },
      update: {},
      create: { slug: 'admin:access', description: 'Access admin' },
    }),
    prisma.permission.upsert({
      where: { slug: 'users:manage' },
      update: {},
      create: { slug: 'users:manage', description: 'Manage users' },
    }),
  ]);

  const superAdminRole = await prisma.role.upsert({
    where: { slug: 'super_admin' },
    update: {},
    create: {
      slug: 'super_admin',
      name: 'Super Admin',
      description: 'Full access',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { slug: 'editor' },
    update: {},
    create: { slug: 'editor', name: 'Editor', description: 'Content editor' },
  });

  const memberRole = await prisma.role.upsert({
    where: { slug: 'member' },
    update: {},
    create: { slug: 'member', name: 'Member', description: 'Paid member' },
  });

  const customerRole = await prisma.role.upsert({
    where: { slug: 'customer' },
    update: {},
    create: { slug: 'customer', name: 'Customer', description: 'Store customer' },
  });

  for (const p of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: superAdminRole.id, permissionId: p.id },
      },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: p.id },
    });
  }

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: editorRole.id,
        permissionId: permissions[0].id,
      },
    },
    update: {},
    create: { roleId: editorRole.id, permissionId: permissions[0].id },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: editorRole.id,
        permissionId: permissions[1].id,
      },
    },
    update: {},
    create: { roleId: editorRole.id, permissionId: permissions[1].id },
  });

  const freePlan = await prisma.plan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      name: 'Free',
      slug: 'free',
      interval: 'month',
      amountCents: 0,
      description: 'Get started',
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'pro-monthly' },
    update: {},
    create: {
      name: 'Pro',
      slug: 'pro-monthly',
      interval: 'month',
      amountCents: 2900,
      stripePriceId: process.env.STRIPE_PRICE_MONTHLY ?? 'price_stub_monthly',
      description: 'Full access',
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'pro-yearly' },
    update: {},
    create: {
      name: 'Pro (Yearly)',
      slug: 'pro-yearly',
      interval: 'year',
      amountCents: 29000,
      stripePriceId: process.env.STRIPE_PRICE_YEARLY ?? 'price_stub_yearly',
      description: 'Best value',
    },
  });

  const author = await prisma.author.upsert({
    where: { slug: 'team' },
    update: {},
    create: {
      slug: 'team',
      name: 'Platform Team',
      bio: 'We build thoughtful digital products.',
    },
  });

  const catInsights = await prisma.category.upsert({
    where: { slug: 'insights' },
    update: {},
    create: { slug: 'insights', name: 'Insights', description: 'Ideas and updates' },
  });

  const tagProduct = await prisma.tag.upsert({
    where: { slug: 'product' },
    update: {},
    create: { name: 'Product', slug: 'product' },
  });

  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      title: 'About',
      body: '<p>We help modern businesses grow with a unified platform.</p>',
      status: ContentStatus.PUBLISHED,
      seoTitle: 'About Us',
      seoDescription: 'Learn about our mission and team.',
    },
  });

  const post1 = await prisma.post.upsert({
    where: { slug: 'welcome-to-the-platform' },
    update: {},
    create: {
      slug: 'welcome-to-the-platform',
      title: 'Welcome to the platform',
      excerpt: 'A quick tour of what you can build here.',
      body: '<p>This is sample content seeded for development. Replace with your own posts.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 3,
      authorId: author.id,
      seoTitle: 'Welcome',
      seoDescription: 'Introduction post',
    },
  });

  await prisma.post.upsert({
    where: { slug: 'seo-and-content' },
    update: {},
    create: {
      slug: 'seo-and-content',
      title: 'SEO and content marketing',
      excerpt: 'Why structured content matters.',
      body: '<p>Posts include metadata, categories, and tags for discoverability.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 5,
      authorId: author.id,
    },
  });

  const p1 = post1;
  if (p1) {
    await prisma.postCategory.upsert({
      where: {
        postId_categoryId: { postId: p1.id, categoryId: catInsights.id },
      },
      update: {},
      create: { postId: p1.id, categoryId: catInsights.id },
    });
    await prisma.postTag.upsert({
      where: { postId_tagId: { postId: p1.id, tagId: tagProduct.id } },
      update: {},
      create: { postId: p1.id, tagId: tagProduct.id },
    });
  }

  await prisma.product.upsert({
    where: { slug: 'starter-kit' },
    update: {},
    create: {
      slug: 'starter-kit',
      name: 'Starter Kit',
      description: 'Templates and guides',
      priceCents: 4900,
      isDigital: true,
      status: ContentStatus.PUBLISHED,
      seoTitle: 'Starter Kit',
      seoDescription: 'Digital product',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'consulting-hour' },
    update: {},
    create: {
      slug: 'consulting-hour',
      name: 'Consulting Hour',
      description: 'One hour strategy call',
      priceCents: 15000,
      isDigital: false,
      status: ContentStatus.PUBLISHED,
    },
  });

  await prisma.navigationMenu.upsert({
    where: { key: 'header' },
    update: {
      items: [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Services', path: '/services' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Blog', path: '/blog' },
        { label: 'Contact', path: '/contact' },
      ],
    },
    create: {
      key: 'header',
      label: 'Header',
      items: [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Services', path: '/services' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Blog', path: '/blog' },
        { label: 'Contact', path: '/contact' },
      ],
    },
  });

  await prisma.navigationMenu.upsert({
    where: { key: 'footer' },
    update: {
      items: [
        { label: 'Privacy', path: '/privacy-policy' },
        { label: 'Terms', path: '/terms' },
        { label: 'Cookies', path: '/cookies' },
      ],
    },
    create: {
      key: 'footer',
      label: 'Footer',
      items: [
        { label: 'Privacy', path: '/privacy-policy' },
        { label: 'Terms', path: '/terms' },
        { label: 'Cookies', path: '/cookies' },
      ],
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'site' },
    update: {
      value: {
        siteName: 'Platform',
        tagline: 'Modern business platform',
        social: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
      },
    },
    create: {
      key: 'site',
      value: {
        siteName: 'Platform',
        tagline: 'Modern business platform',
        social: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
      },
    },
  });

  await prisma.gatedContentRule.upsert({
    where: { slug: 'members-library' },
    update: {},
    create: {
      slug: 'members-library',
      title: 'Member library',
      requiresSubscription: true,
      minPlanSlug: 'pro-monthly',
      pageSlug: '/library',
    },
  });

  const existingLead = await prisma.formSubmission.findFirst({
    where: { email: 'demo@example.com', type: FormType.CONTACT },
  });
  if (!existingLead) {
    await prisma.formSubmission.create({
      data: {
        type: FormType.CONTACT,
        email: 'demo@example.com',
        name: 'Demo User',
        payload: { message: 'Sample inquiry' },
      },
    });
  }

  console.log('Seed complete.', { freePlan: freePlan.slug, roles: [superAdminRole.slug, memberRole.slug, customerRole.slug] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
