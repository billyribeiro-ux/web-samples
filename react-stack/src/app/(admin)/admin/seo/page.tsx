export default function AdminSeoPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">SEO</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Global defaults live in <code className="rounded bg-muted px-1 text-xs">SiteSetting</code>{" "}
        and per-entity fields on pages and posts. Sitemap is generated in{" "}
        <code className="rounded bg-muted px-1 text-xs">src/app/sitemap.ts</code>.
      </p>
    </div>
  );
}
