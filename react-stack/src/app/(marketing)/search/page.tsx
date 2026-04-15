import type { Metadata } from "next";
import Link from "next/link";
import { siteSearch } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = await siteSearch(q ?? "");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
      <form className="mt-8 flex gap-2" action="/search" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search posts, products, authors, pages…"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          aria-label="Search query"
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Search
        </button>
      </form>
      <ul className="mt-10 space-y-4">
        {results.map((r) => (
          <li key={`${r.type}-${r.id}`}>
            <p className="text-xs uppercase text-muted-foreground">{r.type}</p>
            <Link href={r.href} className="font-medium hover:underline">
              {r.title}
            </Link>
            <p className="text-sm text-muted-foreground">{r.excerpt}</p>
          </li>
        ))}
        {q && !results.length ? (
          <li className="text-sm text-muted-foreground">No results.</li>
        ) : null}
      </ul>
    </div>
  );
}
