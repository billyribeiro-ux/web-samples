import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { catchError, filter, map, of, switchMap, take } from 'rxjs';
import { environment } from '../../../environments/environment';

type MeUser = {
  roles: { role: { slug: string } }[];
};

export const adminGuard = () => {
  const http = inject(HttpClient);
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    switchMap(() => auth.isAuthenticated$.pipe(take(1))),
    switchMap((authed) => {
      if (!authed) {
        router.navigate(['/login']);
        return of(false);
      }
      return http.get<MeUser>(`${environment.apiUrl}/users/me`).pipe(
        map((u) => {
          const slugs = new Set(u.roles.map((r) => r.role.slug));
          if (slugs.has('super_admin') || slugs.has('admin') || slugs.has('editor')) {
            return true;
          }
          router.navigate(['/']);
          return false;
        }),
        catchError(() => {
          router.navigate(['/login']);
          return of(false);
        }),
      );
    }),
  );
};
