import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Site settings</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Key/value JSON settings (branding, analytics flags, etc.).</p>
      <ul className="mt-8 space-y-3 font-mono text-xs">
        {settings.map((s) => (
          <li key={s.id} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
            <strong>{s.key}</strong>
            <pre className="mt-2 overflow-x-auto text-zinc-600 dark:text-zinc-400">{JSON.stringify(s.value, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
