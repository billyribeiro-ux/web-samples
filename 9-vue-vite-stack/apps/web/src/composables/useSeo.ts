import { useHead } from "@unhead/vue";

export function useSeo(opts: {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: string;
}) {
  const site = import.meta.env.VITE_SITE_URL ?? "http://localhost:5173";
  const canonical = opts.canonicalPath ? `${site.replace(/\/$/, "")}${opts.canonicalPath}` : undefined;

  useHead({
    title: opts.title,
    meta: [
      { name: "description", content: opts.description ?? "" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description ?? "" },
      { property: "og:type", content: opts.ogType ?? "website" },
      ...(canonical ? [{ property: "og:url", content: canonical }] : []),
    ],
    link: canonical ? [{ rel: "canonical", href: canonical }] : [],
  });
}
