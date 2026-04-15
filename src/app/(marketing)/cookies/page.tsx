import { buildPageMetadata } from "@/lib/metadata";
import { ProseHtml } from "@/components/content/prose-html";

export const metadata = buildPageMetadata({
  title: "Cookie Policy",
  description: "How we use cookies and similar technologies.",
  path: "/cookies",
});

const html = `
<h2>Cookies</h2>
<p>We use essential cookies for authentication (Clerk) and optional analytics cookies where configured.</p>
<h2>Preferences</h2>
<p>You can control non-essential cookies through your browser settings and any consent banner you configure.</p>
`;

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Cookie Policy</h1>
      <ProseHtml html={html} className="mt-8" />
    </div>
  );
}
