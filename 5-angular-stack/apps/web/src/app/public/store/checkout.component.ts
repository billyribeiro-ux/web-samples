import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="mx-auto max-w-lg px-4 py-12">
      <h1 class="text-3xl font-bold">Checkout</h1>
      <p class="mt-4 text-slate-600">
        Creates a pending order from your cart (requires sign-in). Configure Stripe Checkout on the API for
        payment capture.
      </p>
      @if (msg()) {
        <p class="mt-4 text-sm text-slate-700">{{ msg() }}</p>
      }
      <button mat-raised-button color="primary" class="mt-6" type="button" (click)="submit()">
        Create order
      </button>
    </div>
  `,
})
export class CheckoutComponent {
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  readonly msg = signal<string | null>(null);

  submit() {
    const items = this.cart.items();
    if (!items.length) {
      this.msg.set('Cart is empty.');
      return;
    }
    this.http
      .post<{ id: string }>(`${environment.apiUrl}/orders/checkout`, {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.qty,
          unitCents: i.unitCents,
        })),
      })
      .subscribe({
        next: (o) => {
          this.msg.set(`Order ${o.id} created (pending payment).`);
          this.cart.clear();
          this.router.navigate(['/thank-you'], { queryParams: { order: o.id } });
        },
        error: () =>
          this.msg.set('Could not create order — sign in and ensure the API is running.'),
      });
  }
}
