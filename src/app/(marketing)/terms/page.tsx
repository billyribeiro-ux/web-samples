import { buildPageMetadata } from "@/lib/metadata";
import { ProseHtml } from "@/components/content/prose-html";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "Terms governing use of our services.",
  path: "/terms",
});

const html = `
<h2>Agreement</h2>
<p>By accessing the site you agree to these terms.</p>
<h2>Services</h2>
<p>We provide digital services and content subject to availability and plan limits.</p>
<h2>Liability</h2>
<p>To the maximum extent permitted by law, liability is limited as described in your order or subscription agreement.</p>
`;

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Terms of Service</h1>
      <ProseHtml html={html} className="mt-8" />
    </div>
  );
}
