import { prisma } from "@/lib/db";

export default async function AdminRolesPage() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: { include: { permission: true } },
    },
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Roles</h1>
      <ul className="mt-8 space-y-4">
        {roles.map((r) => (
          <li key={r.id} className="rounded-xl border p-4">
            <p className="font-medium">
              {r.name}{" "}
              <span className="text-muted-foreground">({r.key})</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {r.permissions.map((p) => p.permission.key).join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
