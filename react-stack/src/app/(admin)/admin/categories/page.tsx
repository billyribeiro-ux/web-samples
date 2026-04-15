import { prisma } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <ul className="mt-8 divide-y rounded-xl border">
        {rows.map((c) => (
          <li key={c.id} className="px-4 py-3 text-sm">
            {c.name}{" "}
            <span className="text-muted-foreground">({c.slug})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
