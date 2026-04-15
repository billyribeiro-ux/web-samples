import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';

export type AppAuthValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
};

const AppAuthContext = createContext<AppAuthValue | null>(null);

export const devAuthValue: AppAuthValue = {
  isLoaded: true,
  isSignedIn: false,
  getToken: async () => null,
};

export function DevAuthRoot({ children }: { children: ReactNode }) {
  return <AppAuthContext.Provider value={devAuthValue}>{children}</AppAuthContext.Provider>;
}

/** Must render under ClerkProvider */
export function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const value = useMemo(
    () => ({
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      getToken: () => getToken(),
    }),
    [isLoaded, isSignedIn, getToken]
  );
  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function useAppAuth(): AppAuthValue {
  const ctx = useContext(AppAuthContext);
  if (!ctx) {
    throw new Error('useAppAuth must be used within DevAuthRoot or ClerkAuthBridge');
  }
  return ctx;
}
