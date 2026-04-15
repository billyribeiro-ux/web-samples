import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [posts, products] = await Promise.all([
    prisma.userFavoritePost.findMany({
      where: { userId: session.user.id },
      include: { post: true },
    }),
    prisma.userFavoriteProduct.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Posts
          </h2>
          <ul className="mt-3 space-y-2">
            {posts.map((p) => (
              <li key={p.postId}>
                <Link href={`/blog/${p.post.slug}`} className="hover:underline">
                  {p.post.title}
                </Link>
              </li>
            ))}
            {!posts.length ? (
              <li className="text-sm text-muted-foreground">None yet.</li>
            ) : null}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Products
          </h2>
          <ul className="mt-3 space-y-2">
            {products.map((p) => (
              <li key={p.productId}>
                <Link
                  href={`/products/${p.product.slug}`}
                  className="hover:underline"
                >
                  {p.product.name}
                </Link>
              </li>
            ))}
            {!products.length ? (
              <li className="text-sm text-muted-foreground">None yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
