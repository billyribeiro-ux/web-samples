import { UserProfile } from "@clerk/nextjs";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Profile",
  description: "Manage your profile.",
  path: "/account/profile",
});

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Profile</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Name, email, and security are managed by Clerk.</p>
      <div className="mt-10 flex justify-center">
        <UserProfile path="/account/profile" routing="path" />
      </div>
    </div>
  );
}
