type OrgJsonLdProps = {
  name?: string;
  url?: string;
};

export function OrganizationJsonLd({ name = "Platform", url = process.env.NEXT_PUBLIC_APP_URL }: OrgJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

type ArticleJsonLdProps = {
  title: string;
  description?: string | null;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName: string;
  imageUrl?: string | null;
};

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName,
  imageUrl,
}: ArticleJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description ?? undefined,
    url,
    datePublished: datePublished ?? undefined,
    dateModified: dateModified ?? datePublished ?? undefined,
    author: { "@type": "Person", name: authorName },
    image: imageUrl ?? undefined,
    publisher: {
      "@type": "Organization",
      name: "Platform",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
