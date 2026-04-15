import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { apiUrlRequiresBearerToken } from './core/auth/api-bearer-routes';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        audience: environment.auth0.audience,
        redirect_uri: environment.publicUrl + '/',
      },
      httpInterceptor: {
        allowedList: [
          {
            uriMatcher: (uri) => apiUrlRequiresBearerToken(uri),
            allowAnonymous: true,
            tokenOptions: {
              authorizationParams: {
                audience: environment.auth0.audience,
              },
            },
          },
        ],
      },
    }),
  ],
};
