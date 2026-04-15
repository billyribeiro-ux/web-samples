import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo.service';

type PageDto = {
  title: string;
  body: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

@Component({
  selector: 'app-page-view',
  standalone: true,
  template: `
    <article class="mx-auto max-w-3xl px-4 py-12">
      @if (page()) {
        <h1 class="text-3xl font-bold text-slate-900">{{ page()!.title }}</h1>
        <div class="prose prose-slate mt-8 max-w-none" [innerHTML]="safeHtml()"></div>
      } @else if (error()) {
        <p class="text-red-600">{{ error() }}</p>
      } @else {
        <p class="text-slate-500">Loading…</p>
      }
    </article>
  `,
})
export class PageViewComponent {
  readonly slug = input.required<string>();
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly page = signal<PageDto | null>(null);
  readonly error = signal<string | null>(null);

  readonly safeHtml = computed<SafeHtml>(() => {
    const b = this.page()?.body;
    return b ? this.sanitizer.bypassSecurityTrustHtml(b) : '';
  });

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const s = this.slug();
      if (!s) return;
      this.http.get<PageDto>(`${environment.apiUrl}/pages/public/${s}`).subscribe({
        next: (p) => {
          this.page.set(p);
          this.error.set(null);
          this.seo.setPage({
            title: p.seoTitle || p.title,
            description: p.seoDescription || undefined,
          });
        },
        error: () => {
          this.error.set('Page not found.');
          this.page.set(null);
        },
      });
    });
  }
}
