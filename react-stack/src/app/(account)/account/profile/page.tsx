import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/account/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { settings: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Update your profile and notification preferences.
      </p>
      <div className="mt-8 max-w-md">
        <ProfileForm
          name={user?.name ?? ""}
          marketingEmails={user?.settings?.marketingEmails ?? false}
          newsletterOptIn={user?.settings?.newsletterOptIn ?? false}
          productUpdates={user?.settings?.productUpdates ?? true}
        />
      </div>
    </div>
  );
}
