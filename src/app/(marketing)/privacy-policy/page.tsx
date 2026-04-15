import { buildPageMetadata } from "@/lib/metadata";
import { ProseHtml } from "@/components/content/prose-html";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "How we collect and use personal data.",
  path: "/privacy-policy",
});

const html = `
<h2>Overview</h2>
<p>This policy describes how we process personal data when you use our website and services.</p>
<h2>Data we collect</h2>
<p>We may collect account information, billing details processed by our payment provider, and usage analytics where enabled.</p>
<h2>Contact</h2>
<p>For privacy requests, contact us through the contact form.</p>
`;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Privacy Policy</h1>
      <ProseHtml html={html} className="mt-8" />
    </div>
  );
}
