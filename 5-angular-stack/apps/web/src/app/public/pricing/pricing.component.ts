import { afterNextRender, Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo.service';

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amountCents: number;
  currency: string;
  interval: string;
};

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-12">
      <h1 class="text-center text-3xl font-bold text-slate-900">Pricing</h1>
      <p class="mx-auto mt-3 max-w-xl text-center text-slate-600">
        Simple plans. Upgrade when you need member-only content and premium support.
      </p>
      @if (loadError()) {
        <div
          class="mx-auto mt-10 max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950"
          role="alert"
        >
          <p class="font-medium">Plans could not be loaded.</p>
          <p class="mt-2 text-amber-900/90">
            Start the API (<code class="rounded bg-amber-100/80 px-1">pnpm dev:api</code>) and database
            (<code class="rounded bg-amber-100/80 px-1">pnpm run stack:up</code>), then refresh. The app
            reads plans from <code class="rounded bg-amber-100/80 px-1">{{ apiBase }}</code>.
          </p>
        </div>
      } @else if (loading()) {
        <div class="mt-14 flex justify-center">
          <mat-spinner diameter="40" />
        </div>
      } @else if (plans().length === 0) {
        <p class="mx-auto mt-10 max-w-md text-center text-slate-600">
          No active plans in the database yet. Run <code class="rounded bg-slate-100 px-1">pnpm run db:seed</code>.
        </p>
      } @else {
        <div class="mt-10 grid gap-6 md:grid-cols-3">
          @for (p of plans(); track p.id) {
            <mat-card class="!flex !flex-col">
              <mat-card-title>{{ p.name }}</mat-card-title>
              <mat-card-content class="!flex-1">
                <p class="text-3xl font-bold">
                  {{ p.amountCents / 100 | currency: p.currency.toUpperCase() }}
                  <span class="text-base font-normal text-slate-500">/{{ p.interval }}</span>
                </p>
                <p class="mt-2 text-slate-600">{{ p.description }}</p>
              </mat-card-content>
              <mat-card-actions>
                <a mat-raised-button color="primary" routerLink="/register">Start</a>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
})
export class PricingComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly seo = inject(SeoService);
  readonly plans = signal<Plan[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly apiBase = environment.apiUrl;

  constructor() {
    // SSR cannot reach localhost:3000; load plans only in the browser after hydration.
    afterNextRender(() => {
      this.http.get<Plan[]>(`${environment.apiUrl}/plans`).subscribe({
        next: (rows) => {
          this.plans.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set(true);
        },
      });
    });
  }

  ngOnInit() {
    this.seo.setPage({ title: 'Pricing', description: 'Plans and pricing.' });
  }
}
