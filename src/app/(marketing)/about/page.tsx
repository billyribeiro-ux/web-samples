import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "About",
  description: "Learn about our team, mission, and how we help businesses grow.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">About</h1>
      <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
        We build serious digital platforms—content, commerce, and memberships—with modern infrastructure
        and a focus on SEO, accessibility, and performance.
      </p>
    </div>
  );
}
