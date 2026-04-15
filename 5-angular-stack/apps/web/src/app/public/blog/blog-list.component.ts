import { afterNextRender, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo.service';

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  author: { name: string };
};

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-3xl font-bold text-slate-900">Blog</h1>
      <ul class="mt-8 divide-y divide-slate-200">
        @for (p of posts(); track p.slug) {
          <li class="py-6">
            <a [routerLink]="['/blog', p.slug]" class="text-xl font-semibold text-brand-700 hover:underline">
              {{ p.title }}
            </a>
            <p class="mt-1 text-sm text-slate-500">
              {{ p.publishedAt | date: 'mediumDate' }} · {{ p.author.name }}
            </p>
            @if (p.excerpt) {
              <p class="mt-2 text-slate-600">{{ p.excerpt }}</p>
            }
          </li>
        }
      </ul>
    </div>
  `,
})
export class BlogListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly seo = inject(SeoService);
  readonly posts = signal<Post[]>([]);

  constructor() {
    afterNextRender(() => {
      this.http.get<Post[]>(`${environment.apiUrl}/posts`).subscribe((r) => this.posts.set(r));
    });
  }

  ngOnInit() {
    this.seo.setPage({ title: 'Blog', description: 'Articles and updates.' });
  }
}
