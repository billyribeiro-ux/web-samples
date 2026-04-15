import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-3xl font-bold">Tag: {{ slug() }}</h1>
      <ul class="mt-6 space-y-4">
        @for (row of posts(); track row.post.slug) {
          <li>
            <a [routerLink]="['/blog', row.post.slug]" class="font-medium text-brand-700 hover:underline">
              {{ row.post.title }}
            </a>
          </li>
        }
      </ul>
    </div>
  `,
})
export class TagComponent {
  readonly slug = input.required<string>();
  private readonly http = inject(HttpClient);
  readonly posts = signal<{ post: { slug: string; title: string } }[]>([]);

  constructor() {
    effect(() => {
      const s = this.slug();
      this.http
        .get<{ posts: { post: { slug: string; title: string } }[] }>(
          `${environment.apiUrl}/tags/${s}`,
        )
        .subscribe((t) => this.posts.set(t.posts ?? []));
    });
  }
}
