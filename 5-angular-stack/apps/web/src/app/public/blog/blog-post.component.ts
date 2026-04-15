import { isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo.service';

type Post = {
  title: string;
  body: string;
  excerpt: string | null;
  publishedAt: string | null;
  author: { name: string };
  seoTitle?: string | null;
  seoDescription?: string | null;
};

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [DatePipe],
  template: `
    <article class="mx-auto max-w-3xl px-4 py-12">
      @if (post()) {
        <p class="text-sm text-slate-500">
          {{ post()!.publishedAt | date: 'longDate' }} · {{ post()!.author.name }}
        </p>
        <h1 class="mt-2 text-3xl font-bold text-slate-900">{{ post()!.title }}</h1>
        <div class="prose prose-slate mt-8 max-w-none" [innerHTML]="safe()"></div>
      } @else {
        <p class="text-slate-500">Loading…</p>
      }
    </article>
  `,
})
export class BlogPostComponent {
  readonly slug = input.required<string>();
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly post = signal<Post | null>(null);

  readonly safe = computed<SafeHtml>(() => {
    const b = this.post()?.body;
    return b ? this.sanitizer.bypassSecurityTrustHtml(b) : '';
  });

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const s = this.slug();
      this.http.get<Post>(`${environment.apiUrl}/posts/slug/${s}`).subscribe({
        next: (p) => {
          this.post.set(p);
          this.seo.setPage({
            title: p.seoTitle || p.title,
            description: p.seoDescription || p.excerpt || undefined,
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: p.title,
              datePublished: p.publishedAt,
              author: { '@type': 'Person', name: p.author.name },
            },
          });
        },
        error: () => this.post.set(null),
      });
    });
  }
}
