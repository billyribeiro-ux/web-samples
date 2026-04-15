import { prisma } from "@/lib/db";

export default async function AdminTagsPage() {
  const rows = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
      <ul className="mt-8 divide-y rounded-xl border">
        {rows.map((t) => (
          <li key={t.id} className="px-4 py-3 text-sm">
            {t.name}{" "}
            <span className="text-muted-foreground">({t.slug})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
