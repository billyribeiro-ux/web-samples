import { prisma } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Site settings</h1>
      <ul className="mt-8 space-y-4">
        {settings.map((s) => (
          <li key={s.id} className="rounded-xl border p-4">
            <p className="font-mono text-sm">{s.key}</p>
            <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground">
              {s.valueJson}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
