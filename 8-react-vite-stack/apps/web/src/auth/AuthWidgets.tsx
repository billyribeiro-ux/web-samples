import { SignIn, SignUp, UserButton } from '@clerk/clerk-react';
import { isClerkConfigured } from '@/lib/clerk-config.js';
import { useAppAuth } from '@/auth/app-auth-context.js';

export function AuthSignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAppAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function AuthSignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAppAuth();
  return !isSignedIn ? <>{children}</> : null;
}

export function AuthUserButton() {
  if (!isClerkConfigured()) return null;
  return <UserButton afterSignOutUrl="/" />;
}

export function AuthSignInPage() {
  if (!isClerkConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Sign in unavailable</h1>
        <p className="mt-2 text-slate-600">
          Add a valid <code className="rounded bg-slate-100 px-1">VITE_CLERK_PUBLISHABLE_KEY</code> in{' '}
          <code className="rounded bg-slate-100 px-1">apps/web/.env</code> from{' '}
          <a className="text-sky-700 underline" href="https://dashboard.clerk.com/last-active?path=api-keys">
            Clerk dashboard
          </a>
          , then restart Vite.
        </p>
      </div>
    );
  }
  return <SignIn routing="path" path="/login" signUpUrl="/register" />;
}

export function AuthSignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Sign up unavailable</h1>
        <p className="mt-2 text-slate-600">Configure Clerk (see sign-in page) to enable registration.</p>
      </div>
    );
  }
  return <SignUp routing="path" path="/register" signInUrl="/login" />;
}
