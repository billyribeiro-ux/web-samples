import { createAuthClient } from 'better-auth/react';

const baseURL =
  typeof window !== 'undefined'
    ? window.location.origin
    : (import.meta.env.PUBLIC_SITE_URL ?? 'http://localhost:4321');

export const authClient = createAuthClient({
  baseURL,
});
