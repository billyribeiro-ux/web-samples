import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../environments/environment';

type SubRow = {
  id: string;
  status: string;
  currentPeriodEnd: string | null;
  plan: { name: string };
};

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [DatePipe, MatButtonModule],
  template: `
    <h1 class="text-2xl font-bold">Subscription</h1>
    <button
      mat-stroked-button
      color="primary"
      class="mt-4"
      type="button"
      (click)="openBilling()"
      [disabled]="billingLoading()"
    >
      Manage billing (Stripe)
    </button>
    @if (billingMsg()) {
      <p class="mt-2 text-sm text-slate-600">{{ billingMsg() }}</p>
    }
    <ul class="mt-6 space-y-2">
      @for (s of subs(); track s.id) {
        <li class="rounded border border-slate-200 bg-white p-4">
          <strong>{{ s.plan.name }}</strong> — {{ s.status }}
          @if (s.currentPeriodEnd) {
            <span class="text-slate-500"> · renews {{ s.currentPeriodEnd | date }}</span>
          }
        </li>
      } @empty {
        <p class="text-slate-600">No active subscriptions.</p>
      }
    </ul>
  `,
})
export class SubscriptionComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly subs = signal<SubRow[]>([]);
  readonly billingLoading = signal(false);
  readonly billingMsg = signal<string | null>(null);

  ngOnInit() {
    this.http.get<SubRow[]>(`${environment.apiUrl}/subscriptions/me`).subscribe((r) => this.subs.set(r));
  }

  openBilling() {
    this.billingLoading.set(true);
    this.billingMsg.set(null);
    const returnUrl = `${environment.publicUrl}/account/subscription`;
    this.http
      .post<{ url: string }>(`${environment.apiUrl}/stripe/billing-portal`, { returnUrl })
      .subscribe({
        next: (s) => {
          this.billingLoading.set(false);
          if (s?.url) {
            window.location.href = s.url;
          } else {
            this.billingMsg.set('No portal URL returned.');
          }
        },
        error: (e) => {
          this.billingLoading.set(false);
          this.billingMsg.set(
            e?.error?.message ?? 'Billing portal unavailable — complete a Stripe checkout first.',
          );
        },
      });
  }
}
