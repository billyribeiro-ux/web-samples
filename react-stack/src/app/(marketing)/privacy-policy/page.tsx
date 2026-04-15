import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1>Privacy Policy</h1>
      <p>
        This demo includes privacy-ready instrumentation hooks (PostHog optional)
        and server-side lead storage. Replace this copy with counsel-reviewed
        language before production.
      </p>
    </div>
  );
}
