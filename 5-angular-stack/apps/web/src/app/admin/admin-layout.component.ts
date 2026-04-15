import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatButtonModule,
  ],
  template: `
    <mat-toolbar color="accent">
      <span>Admin</span>
      <span class="flex-1"></span>
      <a mat-button routerLink="/">Exit</a>
    </mat-toolbar>
    <mat-sidenav-container class="!min-h-[560px]">
      <mat-sidenav mode="side" opened class="!w-56">
        <mat-nav-list>
          <a mat-list-item routerLink="/admin" routerLinkActive="bg-slate-100" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a mat-list-item routerLink="/admin/posts" routerLinkActive="bg-slate-100">Posts</a>
          <a mat-list-item routerLink="/admin/pages" routerLinkActive="bg-slate-100">Pages</a>
          <a mat-list-item routerLink="/admin/products" routerLinkActive="bg-slate-100">Products</a>
          <a mat-list-item routerLink="/admin/media" routerLinkActive="bg-slate-100">Media</a>
          <a mat-list-item routerLink="/admin/users" routerLinkActive="bg-slate-100">Users</a>
          <a mat-list-item routerLink="/admin/forms" routerLinkActive="bg-slate-100">Leads</a>
          <a mat-list-item routerLink="/admin/settings" routerLinkActive="bg-slate-100">Settings</a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="p-6">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminLayoutComponent {}
