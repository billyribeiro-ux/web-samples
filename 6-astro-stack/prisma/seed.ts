import 'dotenv/config';

import { hashPassword } from 'better-auth/crypto';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL required for seed');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const permissions = [
    { slug: 'content.read', name: 'Read content' },
    { slug: 'content.write', name: 'Write content' },
    { slug: 'commerce.manage', name: 'Manage commerce' },
    { slug: 'users.manage', name: 'Manage users' },
    { slug: 'settings.manage', name: 'Manage settings' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      create: p,
      update: { name: p.name },
    });
  }

  const roles = [
    { slug: 'superadmin', name: 'Super Admin' },
    { slug: 'admin', name: 'Admin' },
    { slug: 'editor', name: 'Editor' },
    { slug: 'subscriber', name: 'Subscriber' },
    { slug: 'user', name: 'User' },
  ];

  const roleRecords: Record<string, { id: string }> = {};
  for (const r of roles) {
    const row = await prisma.role.upsert({
      where: { slug: r.slug },
      create: r,
      update: { name: r.name },
    });
    roleRecords[r.slug] = row;
  }

  const superadmin = await prisma.permission.findUniqueOrThrow({ where: { slug: 'settings.manage' } });
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: { roleId: roleRecords.superadmin.id, permissionId: superadmin.id },
    },
    create: { roleId: roleRecords.superadmin.id, permissionId: superadmin.id },
    update: {},
  });

  const plans = [
    {
      slug: 'free',
      name: 'Free',
      description: 'Get started with core features.',
      amountMonthly: 0,
      amountYearly: 0,
      sortOrder: 0,
    },
    {
      slug: 'pro',
      name: 'Pro',
      description: 'Full access to members library and premium content.',
      amountMonthly: 2900,
      amountYearly: 29000,
      sortOrder: 1,
    },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      create: p,
      update: {
        name: p.name,
        description: p.description,
        amountMonthly: p.amountMonthly,
        amountYearly: p.amountYearly,
        sortOrder: p.sortOrder,
      },
    });
  }

  const adminEmail = 'admin@example.com';
  let user = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!user) {
    const passwordHash = await hashPassword('Admin123!');
    const id = crypto.randomUUID();
    user = await prisma.user.create({
      data: {
        id,
        name: 'Site Admin',
        email: adminEmail,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await prisma.profile.create({
      data: { userId: user.id },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: user.id, roleId: roleRecords.superadmin.id },
    },
    create: { userId: user.id, roleId: roleRecords.superadmin.id },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: 'site.name' },
    create: { key: 'site.name', value: 'Astro Business' },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: 'site.tagline' },
    create: { key: 'site.tagline', value: 'Marketing, memberships, and commerce — one platform.' },
    update: {},
  });

  const mainNav = await prisma.navigationMenu.upsert({
    where: { slug: 'main' },
    create: { slug: 'main', name: 'Main' },
    update: {},
  });

  const items = [
    { label: 'Home', href: '/', sortOrder: 0 },
    { label: 'About', href: '/about', sortOrder: 1 },
    { label: 'Services', href: '/services', sortOrder: 2 },
    { label: 'Pricing', href: '/pricing', sortOrder: 3 },
    { label: 'Blog', href: '/blog', sortOrder: 4 },
    { label: 'Contact', href: '/contact', sortOrder: 5 },
  ];

  await prisma.navigationItem.deleteMany({ where: { menuId: mainNav.id } });
  for (const it of items) {
    await prisma.navigationItem.create({
      data: { menuId: mainNav.id, label: it.label, href: it.href, sortOrder: it.sortOrder },
    });
  }

  const author = await prisma.author.upsert({
    where: { slug: 'team' },
    create: { slug: 'team', name: 'Editorial Team', bio: 'We write about product, growth, and craft.' },
    update: {},
  });

  const cat = await prisma.category.upsert({
    where: { slug: 'announcements' },
    create: { slug: 'announcements', name: 'Announcements', description: 'Product news' },
    update: {},
  });

  const tag = await prisma.tag.upsert({
    where: { slug: 'launch' },
    create: { slug: 'launch', name: 'Launch' },
    update: {},
  });

  await prisma.post.upsert({
    where: { slug: 'welcome-to-the-platform' },
    create: {
      slug: 'welcome-to-the-platform',
      title: 'Welcome to the platform',
      excerpt: 'How we built a serious Astro + Postgres stack for modern businesses.',
      body: '<p>This is a <strong>rich HTML</strong> article body. It demonstrates the blog engine, SEO fields, and CMS-backed content.</p><p>Thanks for reading.</p>',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      readingMinutes: 4,
      authorId: author.id,
      seoTitle: 'Welcome to the platform',
      seoDescription: 'Introduction to the Astro business platform.',
    },
    update: {},
  });

  const post = await prisma.post.findUniqueOrThrow({
    where: { slug: 'welcome-to-the-platform' },
  });

  await prisma.postCategory.upsert({
    where: { postId_categoryId: { postId: post.id, categoryId: cat.id } },
    create: { postId: post.id, categoryId: cat.id },
    update: {},
  });

  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post.id, tagId: tag.id } },
    create: { postId: post.id, tagId: tag.id },
    update: {},
  });

  const pc = await prisma.productCategory.upsert({
    where: { slug: 'templates' },
    create: { slug: 'templates', name: 'Templates', description: 'Starter kits' },
    update: {},
  });

  await prisma.product.upsert({
    where: { slug: 'premium-template-pack' },
    create: {
      slug: 'premium-template-pack',
      name: 'Premium Template Pack',
      description: 'Production-ready UI blocks and layouts for your next launch.',
      price: 7900,
      type: 'DIGITAL',
      categoryId: pc.id,
      isActive: true,
      featured: true,
    },
    update: {},
  });

  await prisma.page.upsert({
    where: { slug: 'privacy-policy' },
    create: {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      body: '<p>We respect your privacy. This demo page outlines data practices for the sample deployment.</p>',
      status: 'PUBLISHED',
      seoTitle: 'Privacy Policy',
      seoDescription: 'Privacy policy for Astro Business.',
    },
    update: {},
  });

  console.info('Seed complete. Admin login:', adminEmail, '/ Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
