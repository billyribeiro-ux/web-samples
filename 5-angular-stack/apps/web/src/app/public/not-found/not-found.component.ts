import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 class="text-4xl font-bold text-slate-800">404</h1>
      <p class="mt-2 text-slate-600">This page could not be found.</p>
      <a routerLink="/" class="mt-6 font-medium text-brand-600 hover:underline">Back home</a>
    </div>
  `,
})
export class NotFoundComponent {}
