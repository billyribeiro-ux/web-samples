import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <section class="bg-gradient-to-b from-brand-50 to-white px-4 py-20">
      <div class="mx-auto max-w-4xl text-center">
        <p class="text-sm font-semibold uppercase tracking-widest text-brand-600">Modern platform</p>
        <h1 class="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Grow your business with content, commerce, and memberships
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          A production-minded stack: Angular SSR, NestJS API, PostgreSQL, Auth0, and Stripe — ready to
          extend.
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <a mat-raised-button color="primary" routerLink="/pricing">View pricing</a>
          <a mat-stroked-button color="primary" routerLink="/contact">Talk to us</a>
        </div>
      </div>
    </section>
    <section class="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">SEO content</h2>
        <p class="mt-2 text-slate-600">Blog, metadata, sitemap, and structured data hooks.</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Commerce</h2>
        <p class="mt-2 text-slate-600">Products, cart, Stripe Checkout, and order history.</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Admin CMS</h2>
        <p class="mt-2 text-slate-600">Manage posts, pages, media, and leads with RBAC.</p>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit() {
    this.seo.setPage({
      title: 'Platform — Home',
      description: 'Modern business platform with marketing site, blog, store, and memberships.',
    });
  }
}
