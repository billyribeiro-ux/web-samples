import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  setPage(opts: {
    title: string;
    description?: string;
    canonical?: string;
    jsonLd?: Record<string, unknown>;
  }) {
    this.title.setTitle(opts.title);
    if (opts.description) {
      this.meta.updateTag({ name: 'description', content: opts.description });
      this.meta.updateTag({ property: 'og:description', content: opts.description });
    }
    this.meta.updateTag({ property: 'og:title', content: opts.title });
    if (opts.canonical) {
      let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = this.doc.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.doc.head.appendChild(link);
      }
      link.setAttribute('href', opts.canonical);
    }
    if (opts.jsonLd) {
      let script = this.doc.getElementById('jsonld-page') as HTMLScriptElement | null;
      if (!script) {
        script = this.doc.createElement('script');
        script.id = 'jsonld-page';
        script.type = 'application/ld+json';
        this.doc.head.appendChild(script);
      }
      script.textContent = JSON.stringify(opts.jsonLd);
    }
  }
}
