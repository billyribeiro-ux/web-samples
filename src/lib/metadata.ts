import type { Metadata } from "next";

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function buildPageMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
}): Metadata {
  const url = opts.path ? new URL(opts.path, base).toString() : base;
  return {
    title: opts.title,
    description: opts.description,
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Platform",
      images: opts.ogImage ? [{ url: opts.ogImage }] : undefined,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: opts.ogImage ? [opts.ogImage] : undefined,
    },
  };
}
