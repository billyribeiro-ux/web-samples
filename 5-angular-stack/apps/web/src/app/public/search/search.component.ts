import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';

type Hit = { type: string; title: string; excerpt: string | null; path: string };

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-3xl font-bold">Search</h1>
      <div class="mt-6 flex flex-wrap gap-2">
        <mat-form-field class="!min-w-[240px] flex-1">
          <mat-label>Query</mat-label>
          <input matInput [(ngModel)]="q" (keyup.enter)="run()" />
        </mat-form-field>
        <button mat-raised-button color="primary" type="button" (click)="run()">Search</button>
      </div>
      <ul class="mt-8 space-y-3">
        @for (h of hits(); track h.path + h.title) {
          <li>
            <a [routerLink]="h.path" class="font-medium text-brand-700 hover:underline">{{ h.title }}</a>
            <span class="ml-2 text-xs uppercase text-slate-400">{{ h.type }}</span>
            @if (h.excerpt) {
              <p class="text-sm text-slate-600">{{ h.excerpt }}</p>
            }
          </li>
        }
      </ul>
    </div>
  `,
})
export class SearchComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  q = '';
  readonly hits = signal<Hit[]>([]);

  constructor() {
    this.route.queryParamMap.subscribe((p) => {
      const qq = p.get('q') ?? '';
      this.q = qq;
      if (qq) this.run();
    });
  }

  run() {
    const qq = this.q.trim();
    if (!qq) {
      this.hits.set([]);
      return;
    }
    this.http
      .get<Hit[]>(`${environment.apiUrl}/search`, { params: { q: qq } })
      .subscribe((r) => this.hits.set(r));
  }
}
