import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  template: `
    <div class="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 class="text-3xl font-bold text-green-800">Thank you</h1>
      <p class="mt-4 text-slate-600">
        @if (order()) {
          Your reference: <strong>{{ order() }}</strong>
        } @else {
          Your submission or purchase was received.
        }
      </p>
    </div>
  `,
})
export class ThankYouComponent {
  private readonly route = inject(ActivatedRoute);
  readonly order = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('order'))), {
    initialValue: null,
  });
}
