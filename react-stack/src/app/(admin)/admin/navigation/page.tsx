import { prisma } from "@/lib/db";

export default async function AdminNavigationPage() {
  const menus = await prisma.navigationMenu.findMany();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Navigation</h1>
      <ul className="mt-8 space-y-6">
        {menus.map((m) => (
          <li key={m.id} className="rounded-xl border p-4">
            <p className="font-medium">
              {m.label}{" "}
              <span className="text-muted-foreground">({m.key})</span>
            </p>
            <pre className="mt-3 max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
              {m.itemsJson}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
