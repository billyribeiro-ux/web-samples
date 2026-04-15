import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="mx-auto max-w-md px-4 py-20 text-center">
      <h1 class="text-2xl font-bold">Create account</h1>
      <p class="mt-2 text-slate-600">Sign up via Auth0.</p>
      <button mat-raised-button color="primary" class="mt-6" type="button" (click)="signup()">
        Continue
      </button>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);

  signup() {
    this.auth.loginWithRedirect({
      authorizationParams: { screen_hint: 'signup' },
      appState: { returnTo: `${environment.publicUrl}/account` },
    });
  }
}
