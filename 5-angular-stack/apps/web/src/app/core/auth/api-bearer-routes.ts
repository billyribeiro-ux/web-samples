import { environment } from '../../../environments/environment';

/**
 * Returns true only for API routes that use JwtAuthGuard in the Nest app.
 * Public routes (plans, posts, products, navigation, search, etc.) must return false
 * so the Auth0 interceptor does not call getAccessTokenSilently — which breaks when
 * Auth0 is not configured or the user is anonymous.
 */
export function apiUrlRequiresBearerToken(requestUrl: string): boolean {
  const base = environment.apiUrl.replace(/\/$/, '');
  if (!requestUrl.startsWith(base)) {
    return false;
  }
  const rest = requestUrl.slice(base.length).replace(/^\/+/, '');
  const parts = rest.split('/').filter(Boolean);
  const a = parts[0]?.toLowerCase() ?? '';
  const b = parts[1]?.toLowerCase() ?? '';

  if (a === 'users') return true;
  if (rest.toLowerCase().includes('/admin')) return true;
  if (a === 'subscriptions' && b === 'me') return true;
  if (a === 'orders' && (b === 'me' || b === 'checkout')) return true;
  if (a === 'favorites' && b === 'me') return true;
  if (a === 'gated') return true;
  if (a === 'media') return true;
  if (a === 'stripe' && b && b !== 'webhook') return true;
  return false;
}
