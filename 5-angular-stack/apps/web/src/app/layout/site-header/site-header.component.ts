import { afterNextRender, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { environment } from '../../../environments/environment';

type NavItem = { label: string; path: string };

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar color="primary" class="shadow-sm !h-auto !min-h-[56px] py-2">
      <a routerLink="/" class="text-lg font-semibold tracking-tight text-white">Platform</a>
      <span class="flex-1"></span>
      <nav class="hidden flex-wrap items-center gap-1 md:flex">
        @for (item of navItems(); track item.path) {
          <a
            mat-button
            [routerLink]="item.path"
            routerLinkActive="bg-white/15"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            class="!text-white"
          >
            {{ item.label }}
          </a>
        }
      </nav>
      <span class="flex-1"></span>
      @if (auth.isAuthenticated$ | async) {
        <a mat-button routerLink="/account" class="!text-white">Account</a>
        <a mat-button routerLink="/admin" class="!text-white">Admin</a>
        <button mat-button type="button" class="!text-white" (click)="logout()">Log out</button>
      } @else {
        <a mat-button routerLink="/login" class="!text-white">Log in</a>
        <a mat-raised-button routerLink="/register" color="accent" class="!bg-white !text-brand-900">
          Sign up
        </a>
      }
    </mat-toolbar>
  `,
})
export class SiteHeaderComponent {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly navItems = signal<NavItem[]>([
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
    { label: 'Products', path: '/products' },
    { label: 'Contact', path: '/contact' },
  ]);

  constructor() {
    afterNextRender(() => {
      this.http.get<{ items: unknown }>(`${environment.apiUrl}/navigation/header`).subscribe({
        next: (res) => {
          const raw = res?.items as NavItem[] | undefined;
          if (raw?.length) {
            this.navItems.set(raw.map((i) => ({ label: i.label, path: i.path })));
          }
        },
        error: () => {},
      });
    });
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: environment.publicUrl } });
  }
}
