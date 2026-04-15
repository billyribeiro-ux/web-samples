import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: { quantity: number; unitCents: number; product: { name: string } }[];
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <h1 class="text-2xl font-bold">Orders</h1>
    <ul class="mt-4 space-y-4">
      @for (o of orders(); track o.id) {
        <li class="rounded border border-slate-200 bg-white p-4">
          <p class="font-medium">
            {{ o.id }} — {{ o.status }} — {{ o.totalCents / 100 | currency: o.currency.toUpperCase() }}
          </p>
          <p class="text-sm text-slate-500">{{ o.createdAt | date: 'medium' }}</p>
          <ul class="mt-2 text-sm">
            @for (it of o.items; track $index) {
              <li>{{ it.product.name }} × {{ it.quantity }}</li>
            }
          </ul>
        </li>
      } @empty {
        <p class="text-slate-600">No orders yet.</p>
      }
    </ul>
  `,
})
export class OrdersComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly orders = signal<Order[]>([]);

  ngOnInit() {
    this.http.get<Order[]>(`${environment.apiUrl}/orders/me`).subscribe((r) => this.orders.set(r));
  }
}
