import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-3xl font-bold text-slate-900">Services</h1>
      <p class="mt-4 text-slate-600">
        Strategy, implementation, and ongoing support for digital products and content operations.
      </p>
      <a routerLink="/contact" class="mt-8 inline-block font-medium text-brand-600 hover:underline"
        >Get in touch</a
      >
    </div>
  `,
})
export class ServicesComponent implements OnInit {
  private readonly seo = inject(SeoService);
  ngOnInit() {
    this.seo.setPage({ title: 'Services', description: 'What we offer.' });
  }
}
