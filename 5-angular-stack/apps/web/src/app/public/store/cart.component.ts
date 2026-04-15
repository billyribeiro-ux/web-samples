import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatButtonModule],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-3xl font-bold">Cart</h1>
      @if (!cart.count()) {
        <p class="mt-6 text-slate-600">Your cart is empty.</p>
      } @else {
        <ul class="mt-6 divide-y divide-slate-200">
          @for (line of cart.items(); track line.productId) {
            <li class="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p class="font-medium">{{ line.name }}</p>
                <p class="text-sm text-slate-500">
                  {{ line.unitCents / 100 | currency: 'USD' }} ×
                  <input
                    type="number"
                    min="1"
                    class="w-16 rounded border border-slate-300 px-1"
                    [value]="line.qty"
                    (change)="setQty(line.productId, $event)"
                  />
                </p>
              </div>
              <button mat-button type="button" (click)="cart.setQty(line.productId, 0)">Remove</button>
            </li>
          }
        </ul>
        <p class="mt-6 text-xl font-semibold">
          Total: {{ cart.totalCents() / 100 | currency: 'USD' }}
        </p>
        <a mat-raised-button color="primary" class="mt-6 inline-block" routerLink="/checkout">
          Checkout
        </a>
      }
    </div>
  `,
})
export class CartComponent {
  readonly cart = inject(CartService);

  setQty(productId: string, ev: Event) {
    const v = Number((ev.target as HTMLInputElement).value);
    this.cart.setQty(productId, Number.isFinite(v) ? v : 1);
  }
}
