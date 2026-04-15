import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Verify email</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Email verification tokens can be issued via Auth.js providers or custom
        flows. Wire a verification link from Resend when you enable production
        email.
      </p>
      <p className="mt-6 text-sm">
        <Link href="/account" className="underline">
          Go to account
        </Link>
      </p>
    </div>
  );
}
