import { Suspense } from "react";
import Link from "next/link";
import { searchSite } from "@/lib/search";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Search",
  description: "Search posts, pages, and products.",
  path: "/search",
});

async function SearchResults({ query }: { query: string }) {
  const hits = await searchSite(query);
  if (!hits.length) {
    return <p className="text-zinc-500">No results for &quot;{query}&quot;.</p>;
  }
  return (
    <ul className="space-y-4">
      {hits.map((h) => (
        <li key={`${h.type}-${h.id}`}>
          <Link href={h.href} className="text-lg font-medium text-emerald-800 hover:underline dark:text-emerald-400">
            {h.title}
          </Link>
          <p className="text-xs uppercase text-zinc-500">{h.type}</p>
          {h.excerpt && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{h.excerpt}</p>}
        </li>
      ))}
    </ul>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Search</h1>
      <form className="mt-8 flex gap-2" action="/search" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search content…"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
        >
          Search
        </button>
      </form>
      <div className="mt-10">
        {q ? (
          <Suspense fallback={<p className="text-zinc-500">Searching…</p>}>
            <SearchResults query={q} />
          </Suspense>
        ) : (
          <p className="text-zinc-500">Enter a query to search posts, pages, and products.</p>
        )}
      </div>
    </div>
  );
}
