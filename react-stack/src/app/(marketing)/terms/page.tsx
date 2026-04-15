import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1>Terms of Service</h1>
      <p>
        Placeholder terms for the starter. Wire your jurisdiction-specific terms
        and link them from checkout and account flows.
      </p>
    </div>
  );
}
