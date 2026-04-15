import { prisma } from "@/lib/db";

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Uploads use S3-compatible storage when AWS env vars are set. See{" "}
        <code className="rounded bg-muted px-1 text-xs">/api/upload</code>.
      </p>
      <ul className="mt-8 divide-y rounded-xl border">
        {assets.map((a) => (
          <li key={a.id} className="px-4 py-3 text-sm">
            <a className="underline" href={a.url} target="_blank" rel="noreferrer">
              {a.key}
            </a>
          </li>
        ))}
        {!assets.length ? (
          <li className="px-4 py-3 text-sm text-muted-foreground">No assets yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
