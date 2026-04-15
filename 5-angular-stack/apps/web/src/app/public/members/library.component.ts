import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-library',
  standalone: true,
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-3xl font-bold">Member library</h1>
      @if (access()?.allowed) {
        <p class="mt-4 text-slate-600">You have access to gated content for this area.</p>
      } @else {
        <p class="mt-4 text-amber-800">Upgrade your plan for full library access.</p>
      }
    </div>
  `,
})
export class LibraryComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly access = signal<{ allowed: boolean } | null>(null);

  ngOnInit() {
    this.http
      .get<{ allowed: boolean }>(`${environment.apiUrl}/gated/access`, {
        params: { slug: 'members-library' },
      })
      .subscribe((r) => this.access.set(r));
  }
}
