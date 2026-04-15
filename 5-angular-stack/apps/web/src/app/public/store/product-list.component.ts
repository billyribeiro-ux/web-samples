import { afterNextRender, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { CartService } from '../../core/services/cart.service';

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
};

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatButtonModule],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-12">
      <h1 class="text-3xl font-bold">Products</h1>
      <div class="mt-8 grid gap-6 sm:grid-cols-2">
        @for (p of products(); track p.id) {
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold">
              <a [routerLink]="['/products', p.slug]" class="hover:text-brand-600">{{ p.name }}</a>
            </h2>
            @if (p.description) {
              <p class="mt-2 text-slate-600">{{ p.description }}</p>
            }
            <p class="mt-4 text-xl font-bold">
              {{ p.priceCents / 100 | currency: p.currency.toUpperCase() }}
            </p>
            <button
              mat-stroked-button
              color="primary"
              class="mt-4"
              type="button"
              (click)="add(p)"
            >
              Add to cart
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProductListComponent {
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);
  readonly products = signal<Product[]>([]);

  constructor() {
    afterNextRender(() => {
      this.http.get<Product[]>(`${environment.apiUrl}/products`).subscribe((r) => this.products.set(r));
    });
  }

  add(p: Product) {
    this.cart.add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      unitCents: p.priceCents,
    });
  }
}
