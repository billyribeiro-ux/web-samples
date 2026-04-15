import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="mx-auto max-w-md px-4 py-20 text-center">
      <h1 class="text-2xl font-bold">Log in</h1>
      <p class="mt-2 text-slate-600">You will be redirected to Auth0.</p>
      <button mat-raised-button color="primary" class="mt-6" type="button" (click)="login()">
        Continue
      </button>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);

  login() {
    this.auth.loginWithRedirect({
      appState: { returnTo: `${environment.publicUrl}/account` },
    });
  }
}
