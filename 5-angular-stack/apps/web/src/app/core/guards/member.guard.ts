import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { filter, map, switchMap, take } from 'rxjs';

export const memberGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    switchMap(() => auth.isAuthenticated$.pipe(take(1))),
    map((authed) => {
      if (authed) return true;
      router.navigate(['/login']);
      return false;
    }),
  );
};
