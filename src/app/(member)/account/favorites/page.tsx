import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensureDbUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Favorites",
  description: "Saved products.",
  path: "/account/favorites",
});

export default async function FavoritesPage() {
  const user = await ensureDbUser();
  if (!user) return null;

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Favorites</h1>
      <ul className="mt-8 space-y-4">
        {favs.map((f) => (
          <li key={f.id}>
            <Link href={`/services/${f.product.slug}`} className="font-medium text-emerald-800 hover:underline dark:text-emerald-400">
              {f.product.title}
            </Link>
          </li>
        ))}
      </ul>
      {favs.length === 0 && <p className="mt-8 text-zinc-500">No favorites yet.</p>}
    </div>
  );
}
