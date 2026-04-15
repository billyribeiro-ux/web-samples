import { Navigate } from 'react-router-dom';
import { isClerkConfigured } from '@/lib/clerk-config.js';
import { useAppAuth } from '@/auth/app-auth-context.js';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAppAuth();

  if (!isClerkConfigured()) {
    return <>{children}</>;
  }
  if (!isLoaded) {
    return <p className="px-6 py-10 text-slate-600">Loading…</p>;
  }
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
