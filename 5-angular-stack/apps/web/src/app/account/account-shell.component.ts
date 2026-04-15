import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Account</span>
    </mat-toolbar>
    <mat-sidenav-container class="!min-h-[480px]">
      <mat-sidenav mode="side" opened class="!w-56">
        <mat-nav-list>
          <a mat-list-item routerLink="/account" routerLinkActive="bg-slate-100" [routerLinkActiveOptions]="{ exact: true }">
            Overview
          </a>
          <a mat-list-item routerLink="/account/profile" routerLinkActive="bg-slate-100">Profile</a>
          <a mat-list-item routerLink="/account/subscription" routerLinkActive="bg-slate-100">
            Subscription
          </a>
          <a mat-list-item routerLink="/account/orders" routerLinkActive="bg-slate-100">Orders</a>
          <a mat-list-item routerLink="/account/favorites" routerLinkActive="bg-slate-100">Favorites</a>
          <a mat-list-item routerLink="/library" routerLinkActive="bg-slate-100">Library</a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="p-6">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AccountShellComponent {}
