import 'dotenv/config';
import { PrismaClient, ContentStatus, ProductStatus, UserRole, FormType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const author = await prisma.author.upsert({
    where: { slug: 'jane-doe' },
    update: {},
    create: {
      slug: 'jane-doe',
      name: 'Jane Doe',
      bio: 'Principal writer covering product, growth, and engineering.',
    },
  });

  const catProduct = await prisma.category.upsert({
    where: { slug: 'product' },
    update: {},
    create: { slug: 'product', name: 'Product', description: 'Product strategy and delivery.' },
  });

  const catEngineering = await prisma.category.upsert({
    where: { slug: 'engineering' },
    update: {},
    create: { slug: 'engineering', name: 'Engineering', description: 'Technical deep dives.' },
  });

  const tagGrowth = await prisma.tag.upsert({
    where: { slug: 'growth' },
    update: {},
    create: { slug: 'growth', name: 'Growth' },
  });

  const tagSecurity = await prisma.tag.upsert({
    where: { slug: 'security' },
    update: {},
    create: { slug: 'security', name: 'Security' },
  });

  const posts = [
    {
      slug: 'ship-quality-faster',
      title: 'How we ship quality without slowing down',
      excerpt: 'Practical guardrails that keep velocity high and regressions low.',
      body: '<p>Quality is a throughput problem, not a gate. In this article we outline testing tiers, feature flags, and rollback paths that keep teams moving.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 6,
      categoryId: catEngineering.id,
      authorId: author.id,
      seoTitle: 'Ship quality faster | Acme Journal',
      seoDescription: 'Guardrails for velocity without sacrificing reliability.',
    },
    {
      slug: 'pricing-for-trust',
      title: 'Pricing pages that build trust',
      excerpt: 'Clarity beats cleverness when asking customers to pay.',
      body: '<p>Your pricing page is a product surface. We unpack comparison tables, annual incentives, and objection handling that convert.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 5,
      categoryId: catProduct.id,
      authorId: author.id,
      seoTitle: 'Pricing for trust | Acme Journal',
      seoDescription: 'Design patterns for credible SaaS pricing.',
    },
    {
      slug: 'secure-webhooks',
      title: 'Webhook security checklist',
      excerpt: 'Verify signatures, handle retries, and stay idempotent.',
      body: '<p>Webhooks are a favorite attack surface. Here is a concise checklist for verification, replay protection, and observability.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      readingMinutes: 4,
      categoryId: catEngineering.id,
      authorId: author.id,
    },
  ];

  for (const p of posts) {
    const post = await prisma.post.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        body: p.body,
        status: p.status,
        publishedAt: p.publishedAt,
        readingMinutes: p.readingMinutes,
        categoryId: p.categoryId,
        authorId: p.authorId,
        seoTitle: p.seoTitle ?? p.title,
        seoDescription: p.seoDescription ?? p.excerpt,
      },
      create: {
        ...p,
        seoTitle: p.seoTitle ?? p.title,
        seoDescription: p.seoDescription ?? p.excerpt,
      },
    });
    await prisma.postTag.upsert({
      where: { postId_tagId: { postId: post.id, tagId: tagGrowth.id } },
      update: {},
      create: { postId: post.id, tagId: tagGrowth.id },
    });
    if (p.slug === 'secure-webhooks') {
      await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post.id, tagId: tagSecurity.id } },
        update: {},
        create: { postId: post.id, tagId: tagSecurity.id },
      });
    }
  }

  const pages = [
    {
      slug: 'about',
      title: 'About Acme',
      body: '<p>Acme builds modern digital operations software for ambitious teams.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      body: '<p>We collect only what we need to run the service. Contact privacy@acme.example for requests.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      body: '<p>By using Acme you agree to these terms. This is demo copy for local development.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    {
      slug: 'cookies',
      title: 'Cookie Policy',
      body: '<p>We use essential cookies for authentication and optional analytics cookies with consent.</p>',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  ];

  for (const pg of pages) {
    await prisma.page.upsert({
      where: { slug: pg.slug },
      update: pg,
      create: pg,
    });
  }

  await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      slug: 'starter',
      name: 'Starter',
      description: 'For individuals exploring the platform.',
      isFree: true,
      monthlyPriceCents: 0,
      yearlyPriceCents: 0,
      sortOrder: 0,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      slug: 'pro',
      name: 'Pro',
      description: 'For teams shipping to production.',
      isFree: false,
      monthlyPriceCents: 2900,
      yearlyPriceCents: 29000,
      sortOrder: 1,
    },
  });

  const products = [
    {
      slug: 'playbook-template',
      title: 'Launch Playbook Template',
      description: 'Notion + PDF bundle for coordinated releases.',
      body: '<p>Includes RACI, comms calendar, and rollback checklist.</p>',
      priceCents: 4900,
      digital: true,
      status: ProductStatus.ACTIVE,
    },
    {
      slug: 'office-hours',
      title: 'Monthly Office Hours',
      description: '60 minutes with our team to review architecture or growth.',
      body: '<p>Book after purchase; calendar invite within one business day.</p>',
      priceCents: 15000,
      digital: true,
      status: ProductStatus.ACTIVE,
    },
  ];

  for (const pr of products) {
    await prisma.product.upsert({
      where: { slug: pr.slug },
      update: pr,
      create: pr,
    });
  }

  await prisma.navigationMenu.upsert({
    where: { key: 'header' },
    update: {
      label: 'Header',
      items: [
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    create: {
      key: 'header',
      label: 'Header',
      items: [
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  });

  await prisma.navigationMenu.upsert({
    where: { key: 'footer' },
    update: {
      label: 'Footer',
      items: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Privacy', href: '/privacy-policy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookies', href: '/cookies' },
      ],
    },
    create: {
      key: 'footer',
      label: 'Footer',
      items: [
        { label: 'FAQ', href: '/faq' },
        { label: 'Privacy', href: '/privacy-policy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookies', href: '/cookies' },
      ],
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'site' },
    update: {
      value: {
        name: 'Acme Platform',
        tagline: 'Operate your digital business with confidence.',
        supportEmail: 'support@acme.example',
        social: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
      },
    },
    create: {
      key: 'site',
      value: {
        name: 'Acme Platform',
        tagline: 'Operate your digital business with confidence.',
        supportEmail: 'support@acme.example',
        social: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
      },
    },
  });

  await prisma.gatedContentRule.upsert({
    where: { slug: 'member-welcome' },
    update: {},
    create: {
      slug: 'member-welcome',
      title: 'Welcome to the member library',
      body: '<p>This content is visible to members and above. Upgrade your plan to unlock operational templates.</p>',
      minRole: UserRole.MEMBER,
      published: true,
    },
  });

  const newsletterCount = await prisma.formSubmission.count({
    where: { type: FormType.NEWSLETTER },
  });
  if (newsletterCount === 0) {
    await prisma.formSubmission.create({
      data: {
        type: FormType.NEWSLETTER,
        payload: { email: 'demo@acme.example', source: 'seed' },
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
