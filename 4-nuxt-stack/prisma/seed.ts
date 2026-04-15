import { PrismaClient } from '@prisma/client'
import { hash, Version } from '@node-rs/argon2'

const prisma = new PrismaClient()

async function main() {
  const perms = await Promise.all(
    [
      'admin.access',
      'content.publish',
      'commerce.manage',
      'users.manage',
    ].map((slug) =>
      prisma.permission.upsert({
        where: { slug },
        create: { slug, description: slug },
        update: {},
      }),
    ),
  )

  const superAdmin = await prisma.role.upsert({
    where: { slug: 'super_admin' },
    create: { name: 'Super Admin', slug: 'super_admin' },
    update: {},
  })
  const admin = await prisma.role.upsert({
    where: { slug: 'admin' },
    create: { name: 'Admin', slug: 'admin' },
    update: {},
  })
  const editor = await prisma.role.upsert({
    where: { slug: 'editor' },
    create: { name: 'Editor', slug: 'editor' },
    update: {},
  })
  const member = await prisma.role.upsert({
    where: { slug: 'member' },
    create: { name: 'Member', slug: 'member' },
    update: {},
  })

  for (const p of perms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdmin.id, permissionId: p.id } },
      create: { roleId: superAdmin.id, permissionId: p.id },
      update: {},
    })
  }
  for (const slug of ['admin.access', 'content.publish']) {
    const p = perms.find((x) => x.slug === slug)!
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: admin.id, permissionId: p.id } },
      create: { roleId: admin.id, permissionId: p.id },
      update: {},
    })
  }
  const cp = perms.find((x) => x.slug === 'content.publish')!
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: editor.id, permissionId: cp.id } },
    create: { roleId: editor.id, permissionId: cp.id },
    update: {},
  })

  const passwordHash = await hash('Password123!', {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
    algorithm: Version.Argon2id,
  })

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      emailVerified: true,
      passwordHash,
      roles: { create: [{ roleId: superAdmin.id }] },
    },
    update: { passwordHash },
  })

  await prisma.user.upsert({
    where: { email: 'member@example.com' },
    create: {
      email: 'member@example.com',
      name: 'Member User',
      emailVerified: true,
      passwordHash,
      roles: { create: [{ roleId: member.id }] },
    },
    update: { passwordHash },
  })

  const author = await prisma.author.upsert({
    where: { slug: 'alex-rivera' },
    create: { name: 'Alex Rivera', slug: 'alex-rivera', bio: 'Principal consultant.' },
    update: {},
  })

  const catStrategy = await prisma.category.upsert({
    where: { slug: 'strategy' },
    create: { name: 'Strategy', slug: 'strategy' },
    update: {},
  })
  const catProduct = await prisma.category.upsert({
    where: { slug: 'product' },
    create: { name: 'Product', slug: 'product' },
    update: {},
  })

  const productCatStrategy = await prisma.productCategory.upsert({
    where: { slug: 'strategy' },
    create: { name: 'Strategy', slug: 'strategy' },
    update: {},
  })
  const productCatDigital = await prisma.productCategory.upsert({
    where: { slug: 'digital-goods' },
    create: { name: 'Digital goods', slug: 'digital-goods' },
    update: {},
  })

  const tagGrowth = await prisma.tag.upsert({
    where: { slug: 'growth' },
    create: { name: 'Growth', slug: 'growth' },
    update: {},
  })

  const stripePrice = (key: string) => process.env[key]?.trim() || null

  await prisma.plan.upsert({
    where: { slug: 'starter' },
    create: {
      name: 'Starter',
      slug: 'starter',
      description: 'For individuals and small projects getting started.',
      priceMonthlyCents: 1900,
      priceYearlyCents: 19000,
      features: ['Core platform access', 'Blog & SEO tools', 'Email support'],
      stripePriceMonthlyId: stripePrice('STRIPE_PRICE_STARTER_MONTHLY'),
      stripePriceYearlyId: stripePrice('STRIPE_PRICE_STARTER_YEARLY'),
    },
    update: {
      name: 'Starter',
      description: 'For individuals and small projects getting started.',
      priceMonthlyCents: 1900,
      priceYearlyCents: 19000,
      features: ['Core platform access', 'Blog & SEO tools', 'Email support'],
      ...(stripePrice('STRIPE_PRICE_STARTER_MONTHLY')
        ? { stripePriceMonthlyId: stripePrice('STRIPE_PRICE_STARTER_MONTHLY') }
        : {}),
      ...(stripePrice('STRIPE_PRICE_STARTER_YEARLY')
        ? { stripePriceYearlyId: stripePrice('STRIPE_PRICE_STARTER_YEARLY') }
        : {}),
    },
  })

  await prisma.plan.upsert({
    where: { slug: 'pro' },
    create: {
      name: 'Pro',
      slug: 'pro',
      description: 'For growing teams that need memberships and priority support.',
      priceMonthlyCents: 4900,
      priceYearlyCents: 49000,
      highlighted: true,
      features: ['Everything in Starter', 'Member areas & subscriptions', 'Priority support'],
      stripePriceMonthlyId: stripePrice('STRIPE_PRICE_PRO_MONTHLY'),
      stripePriceYearlyId: stripePrice('STRIPE_PRICE_PRO_YEARLY'),
    },
    update: {
      name: 'Pro',
      description: 'For growing teams that need memberships and priority support.',
      priceMonthlyCents: 4900,
      priceYearlyCents: 49000,
      highlighted: true,
      features: ['Everything in Starter', 'Member areas & subscriptions', 'Priority support'],
      ...(stripePrice('STRIPE_PRICE_PRO_MONTHLY') ? { stripePriceMonthlyId: stripePrice('STRIPE_PRICE_PRO_MONTHLY') } : {}),
      ...(stripePrice('STRIPE_PRICE_PRO_YEARLY') ? { stripePriceYearlyId: stripePrice('STRIPE_PRICE_PRO_YEARLY') } : {}),
    },
  })

  await prisma.navigationMenu.deleteMany({ where: { key: { in: ['header', 'footer'] } } })
  await prisma.navigationMenu.create({
    data: {
      key: 'header',
      label: 'Main',
      items: {
        create: [
          { label: 'Services', href: '/services', sort: 0 },
          { label: 'Products', href: '/products', sort: 1 },
          { label: 'Pricing', href: '/pricing', sort: 2 },
          { label: 'Blog', href: '/blog', sort: 3 },
          { label: 'Contact', href: '/contact', sort: 4 },
        ],
      },
    },
  })
  await prisma.navigationMenu.create({
    data: {
      key: 'footer',
      label: 'Footer',
      items: {
        create: [
          { label: 'Privacy', href: '/privacy-policy', sort: 0 },
          { label: 'Terms', href: '/terms', sort: 1 },
          { label: 'Cookies', href: '/cookies', sort: 2 },
        ],
      },
    },
  })

  await prisma.siteSetting.upsert({
    where: { key: 'brand' },
    create: {
      key: 'brand',
      value: {
        tagline: 'Operate your digital business with confidence.',
        ctaLabel: 'Book a demo',
        ctaHref: '/contact',
      },
    },
    update: {},
  })

  const posts = [
    {
      title: 'How to ship a premium web platform',
      slug: 'ship-premium-web-platform',
      excerpt: 'Architecture choices that keep velocity high as complexity grows.',
      body: '<p>Start with a clear domain model, automate migrations, and treat SEO as infrastructure.</p>',
      readingMinutes: 6,
    },
    {
      title: 'Membership sites that convert',
      slug: 'membership-sites-that-convert',
      excerpt: 'Pricing psychology and onboarding flows that reduce churn.',
      body: '<p>Clarity beats cleverness. Lead with outcomes and proof.</p>',
      readingMinutes: 4,
    },
    {
      title: 'Content ops for small teams',
      slug: 'content-ops-small-teams',
      excerpt: 'Editorial workflows that scale without a large newsroom.',
      body: '<p>Use a headless CMS pattern with strong validation and previews.</p>',
      readingMinutes: 5,
    },
  ] as const

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        body: p.body,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readingMinutes: p.readingMinutes,
        authorId: author.id,
        seoTitle: p.title,
        seoDescription: p.excerpt,
        categories: {
          create: [
            { category: { connect: { id: catStrategy.id } } },
            { category: { connect: { id: catProduct.id } } },
          ],
        },
        tags: { create: [{ tag: { connect: { id: tagGrowth.id } } }] },
      },
      update: {},
    })
  }

  await prisma.page.upsert({
    where: { slug: 'about' },
    create: {
      title: 'About',
      slug: 'about',
      body: '<p>We help modern businesses launch credible digital platforms.</p>',
      status: 'PUBLISHED',
      seoTitle: 'About',
    },
    update: {},
  })

  await prisma.product.upsert({
    where: { slug: 'strategy-sprint' },
    create: {
      name: 'Strategy Sprint',
      slug: 'strategy-sprint',
      description: 'A focused week to align roadmap, metrics, and delivery.',
      priceCents: 1200000,
      inventory: 99,
      isDigital: false,
      active: true,
      categories: {
        create: [{ category: { connect: { id: productCatStrategy.id } } }],
      },
    },
    update: {},
  })

  await prisma.product.upsert({
    where: { slug: 'playbook-digital' },
    create: {
      name: 'Digital Playbook (PDF)',
      slug: 'playbook-digital',
      description: 'Downloadable playbook for content and conversion.',
      priceCents: 4900,
      inventory: 999,
      isDigital: true,
      downloadUrl: 'https://example.com/playbook.pdf',
      active: true,
      categories: {
        create: [{ category: { connect: { id: productCatDigital.id } } }],
      },
    },
    update: {},
  })

  await prisma.gatedContentRule.deleteMany({ where: { resourceId: '/members' } })
  await prisma.gatedContentRule.create({
    data: {
      resourceType: 'route',
      resourceId: '/members',
      minPlanSlug: 'pro',
    },
  })

  console.log('Seed OK', { adminUser: adminUser.email })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
