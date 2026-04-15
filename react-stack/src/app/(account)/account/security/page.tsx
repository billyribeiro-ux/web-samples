import { ChangePasswordForm } from "@/components/account/change-password-form";

export default function SecurityPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Change your password. Use a unique passphrase stored in a password manager.
      </p>
      <div className="mt-8 max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
