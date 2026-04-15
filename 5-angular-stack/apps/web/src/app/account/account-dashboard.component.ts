import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <h1 class="text-2xl font-bold">Welcome</h1>
    @if (auth.user$ | async; as user) {
      <p class="mt-2 text-slate-600">Signed in as {{ user.email }}</p>
    }
  `,
})
export class AccountDashboardComponent {
  readonly auth = inject(AuthService);
}
