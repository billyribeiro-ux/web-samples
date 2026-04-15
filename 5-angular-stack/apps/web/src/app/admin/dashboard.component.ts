import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <p class="mt-2 text-slate-600">Use the navigation to manage content, commerce, and leads.</p>
  `,
})
export class AdminDashboardComponent {}
