import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-slate-200 bg-white py-10 text-sm text-slate-600">
      <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:justify-between">
        <div>
          <p class="font-semibold text-slate-900">Platform</p>
          <p class="mt-1 max-w-sm">Modern business platform — content, commerce, and memberships.</p>
        </div>
        <div class="flex flex-wrap gap-6">
          <a routerLink="/privacy-policy" class="hover:text-brand-600">Privacy</a>
          <a routerLink="/terms" class="hover:text-brand-600">Terms</a>
          <a routerLink="/cookies" class="hover:text-brand-600">Cookies</a>
          <a routerLink="/faq" class="hover:text-brand-600">FAQ</a>
        </div>
      </div>
      <p class="mt-8 text-center text-xs text-slate-500">
        © {{ year }} Platform. All rights reserved.
      </p>
    </footer>
  `,
})
export class SiteFooterComponent {
  readonly year = new Date().getFullYear();
}
