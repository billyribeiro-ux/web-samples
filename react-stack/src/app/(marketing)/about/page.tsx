import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Our mission, craft, and how we partner with modern teams.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">About</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        We build durable web platforms where marketing, content, memberships,
        and commerce share one coherent data model — so teams ship faster with
        fewer integration seams.
      </p>
    </div>
  );
}
