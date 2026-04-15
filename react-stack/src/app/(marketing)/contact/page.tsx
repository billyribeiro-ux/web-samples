import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a message to our team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-4 text-muted-foreground">
        We respond within two business days. This form is rate-limited and
        validated on the server.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
