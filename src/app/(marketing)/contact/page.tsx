import { buildPageMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata = buildPageMetadata({
  title: "Contact",
  description: "Get in touch with our team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Contact</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">We typically respond within one business day.</p>
      <ContactForm className="mt-10" />
    </div>
  );
}
