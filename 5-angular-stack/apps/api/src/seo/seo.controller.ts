import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('seo')
export class SeoController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async sitemap() {
    const base = this.config.get<string>('PUBLIC_APP_URL') ?? 'http://localhost:4200';
    const [posts, pages, products] = await Promise.all([
      this.prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.page.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const urls: string[] = [`${base}/`, `${base}/blog`, `${base}/products`, `${base}/pricing`];
    for (const p of posts) urls.push(`${base}/blog/${p.slug}`);
    for (const p of pages) urls.push(`${base}/${p.slug}`);
    for (const p of products) urls.push(`${base}/products/${p.slug}`);

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url><loc>${loc}</loc><changefreq>weekly</changefreq></url>`,
  )
  .join('\n')}
</urlset>`;
    return body;
  }

  @Public()
  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  robots() {
    const base = this.config.get<string>('PUBLIC_APP_URL') ?? 'http://localhost:4200';
    const disallow = process.env.NODE_ENV !== 'production' ? 'Disallow: /\n' : '';
    return `User-agent: *
${disallow}Sitemap: ${base}/api/v1/seo/sitemap.xml
`;
  }
}
