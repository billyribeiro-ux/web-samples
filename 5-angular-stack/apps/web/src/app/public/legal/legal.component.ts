import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-legal',
  standalone: true,
  template: `
    <div class="mx-auto max-w-3xl px-4 py-12 prose prose-slate">
      <h1>{{ title() }}</h1>
      <p>
        This is placeholder legal copy for local development. Replace with counsel-approved content before
        production.
      </p>
    </div>
  `,
})
export class LegalComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = toSignal(this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Legal')), {
    initialValue: 'Legal',
  });
}
