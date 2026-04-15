import { PrismaClient, ContentStatus, ProductType } from "@prisma/client";
import { buildSearchContent } from "../src/lib/search";

const prisma = new PrismaClient();

async function main() {
  const author = await prisma.author.upsert({
    where: { slug: "platform-team" },
    update: {},
    create: {
      slug: "platform-team",
      name: "Platform Team",
      bio: "We ship thoughtful software for growing businesses.",
    },
  });

  const cat = await prisma.category.upsert({
    where: { slug: "product" },
    update: {},
    create: { slug: "product", name: "Product", description: "Product updates" },
  });

  const tagSeo = await prisma.tag.upsert({
    where: { slug: "seo" },
    update: {},
    create: { slug: "seo", name: "SEO" },
  });
  const tagEng = await prisma.tag.upsert({
    where: { slug: "engineering" },
    update: {},
    create: { slug: "engineering", name: "Engineering" },
  });

  const posts = [
    {
      slug: "seo-foundations-for-nextjs",
      title: "SEO foundations for Next.js apps",
      excerpt: "Metadata, sitemaps, and structured data without the guesswork.",
      bodyHtml:
        "<p>Technical SEO starts with correct metadata, canonical URLs, and fast server rendering.</p><h2>Sitemaps</h2><p>Use dynamic sitemap routes and keep them in sync with your CMS.</p>",
    },
    {
      slug: "running-stripe-with-webhooks",
      title: "Running Stripe with reliable webhooks",
      excerpt: "Idempotent handlers and database sync patterns.",
      bodyHtml: "<p>Webhooks should be verified, idempotent, and update your local subscription state.</p>",
    },
    {
      slug: "content-workflows-that-scale",
      title: "Content workflows that scale",
      excerpt: "Draft, review, publish—without losing SEO quality.",
      bodyHtml: "<p>Separate draft and published states, and compute reading time on save.</p>",
    },
    {
      slug: "accessible-forms-by-default",
      title: "Accessible forms by default",
      excerpt: "Labels, errors, and focus management with React Hook Form and Zod.",
      bodyHtml: "<p>Pair client and server validation for trustworthy UX.</p>",
    },
    {
      slug: "postgres-search-before-algolia",
      title: "Postgres search before Algolia",
      excerpt: "Start with full-text search; abstract the query layer for future upgrades.",
      bodyHtml: "<p>Use tsvector and GIN indexes for posts and products, then swap the adapter later.</p>",
    },
  ];

  for (const p of posts) {
    const searchContent = buildSearchContent([p.title, p.excerpt, p.bodyHtml.replace(/<[^>]+>/g, " ")]);
    const post = await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        bodyHtml: p.bodyHtml,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: author.id,
        categoryId: cat.id,
        readingMinutes: 6,
        searchContent,
        seoTitle: p.title,
        seoDescription: p.excerpt,
        featuredImageUrl: null,
      },
    });
    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    await prisma.postTag.createMany({
      data: [
        { postId: post.id, tagId: tagSeo.id },
        { postId: post.id, tagId: tagEng.id },
      ],
      skipDuplicates: true,
    });
  }

  const pcat = await prisma.productCategory.upsert({
    where: { slug: "templates" },
    update: {},
    create: { slug: "templates", name: "Templates", description: "Starter kits" },
  });

  const products = [
    {
      slug: "implementation-audit",
      title: "Implementation audit",
      description: "A focused review of your routing, data layer, and deployment pipeline.\nDelivered as a written report with prioritized fixes.",
      priceCents: 250000,
    },
    {
      slug: "launch-playbook",
      title: "Launch playbook (digital)",
      description: "Downloadable checklist and Notion template for shipping a credible v1.",
      priceCents: 4900,
      type: ProductType.DIGITAL,
    },
  ];

  for (const pr of products) {
    const searchContent = buildSearchContent([pr.title, pr.description]);
    await prisma.product.upsert({
      where: { slug: pr.slug },
      update: {},
      create: {
        slug: pr.slug,
        title: pr.title,
        description: pr.description,
        type: pr.type ?? ProductType.SERVICE,
        priceCents: pr.priceCents,
        categoryId: pcat.id,
        published: true,
        searchContent,
        seoTitle: pr.title,
        seoDescription: pr.description.slice(0, 160),
      },
    });
  }

  await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      slug: "pro",
      name: "Pro",
      description: "Full library access and priority support.",
      monthlyAmountCents: 2900,
      yearlyAmountCents: 29000,
      features: ["Library access", "Weekly office hours", "Slack channel"],
      active: true,
      sortOrder: 1,
      stripePriceMonthlyId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "price_placeholder_monthly",
      stripePriceYearlyId: process.env.STRIPE_PRICE_PRO_YEARLY ?? "price_placeholder_yearly",
    },
  });

  await prisma.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      slug: "free",
      name: "Free",
      description: "Newsletter and public content.",
      monthlyAmountCents: 0,
      yearlyAmountCents: 0,
      features: ["Blog access", "Community updates"],
      active: true,
      sortOrder: 0,
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "branding" },
    update: {},
    create: {
      key: "branding",
      value: { siteName: "Platform", tagline: "Serious digital business stack" },
    },
  });

  await prisma.navigationMenu.upsert({
    where: { key: "header" },
    update: {},
    create: {
      key: "header",
      label: "Primary",
      items: [
        { href: "/about", label: "About" },
        { href: "/services", label: "Store" },
        { href: "/pricing", label: "Pricing" },
        { href: "/blog", label: "Blog" },
      ],
    },
  });

  const existingRule = await prisma.gatedContentRule.findFirst({
    where: { pathPattern: "/library" },
  });
  if (!existingRule) {
    await prisma.gatedContentRule.create({
      data: { pathPattern: "/library", requiredRole: null, planId: null },
    });
  }

  const legalHtml =
    "<p>These legal pages are also available as CMS records for admin editing.</p>";
  await prisma.page.upsert({
    where: { slug: "legal-sample" },
    update: {},
    create: {
      slug: "legal-sample",
      title: "Legal sample page",
      bodyHtml: legalHtml,
      status: ContentStatus.PUBLISHED,
      searchContent: buildSearchContent(["Legal sample", legalHtml]),
      seoTitle: "Legal sample",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
