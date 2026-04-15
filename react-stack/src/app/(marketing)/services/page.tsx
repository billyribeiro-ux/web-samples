import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Implementation, optimization, and ongoing platform operations.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Services</h1>
      <ul className="mt-8 list-disc space-y-3 pl-5 text-muted-foreground">
        <li>Productized implementation sprints</li>
        <li>SEO and content operations</li>
        <li>Commerce and subscription hardening</li>
        <li>Admin workflows and permissions modeling</li>
      </ul>
    </div>
  );
}
