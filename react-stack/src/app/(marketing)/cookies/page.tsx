import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1>Cookie Policy</h1>
      <p>
        Describe analytics cookies (PostHog/GA), session cookies, and consent
        management. This build keeps cookies minimal by default.
      </p>
    </div>
  );
}
