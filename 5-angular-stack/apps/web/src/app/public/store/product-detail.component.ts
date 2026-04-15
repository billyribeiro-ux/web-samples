import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, input, PLATFORM_ID, signal } from '@angular/core';
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
  body: string | null;
  priceCents: number;
  currency: string;
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, MatButtonModule],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      @if (product()) {
        <h1 class="text-3xl font-bold">{{ product()!.name }}</h1>
        <p class="mt-4 text-2xl font-semibold">
          {{ product()!.priceCents / 100 | currency: product()!.currency.toUpperCase() }}
        </p>
        @if (product()!.description) {
          <p class="mt-4 text-slate-600">{{ product()!.description }}</p>
        }
        <button mat-raised-button color="primary" class="mt-6" type="button" (click)="add()">
          Add to cart
        </button>
      } @else {
        <p class="text-slate-500">Loading…</p>
      }
    </div>
  `,
})
export class ProductDetailComponent {
  readonly slug = input.required<string>();
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly product = signal<Product | null>(null);

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const s = this.slug();
      this.http.get<Product>(`${environment.apiUrl}/products/slug/${s}`).subscribe({
        next: (p) => this.product.set(p),
        error: () => this.product.set(null),
      });
    });
  }

  add() {
    const p = this.product();
    if (!p) return;
    this.cart.add({ productId: p.id, slug: p.slug, name: p.name, unitCents: p.priceCents });
  }
}
