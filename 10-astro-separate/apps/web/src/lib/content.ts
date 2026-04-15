import { apiServerFetch } from "./api";

export async function getBrand(request: Request) {
  const r = await apiServerFetch(request, "/v1/public/settings/brand");
  if (!r.ok) return {};
  const j = (await r.json()) as { brand?: Record<string, string> };
  return j.brand ?? {};
}

export async function getHomepage(request: Request) {
  const r = await apiServerFetch(request, "/v1/public/settings/homepage");
  if (!r.ok) return {};
  const j = (await r.json()) as { homepage?: Record<string, unknown> };
  return j.homepage ?? {};
}

export async function getPage(request: Request, slug: string) {
  const r = await apiServerFetch(request, `/v1/public/pages/${slug}`);
  if (!r.ok) return null;
  const j = (await r.json()) as { page: { title: string; body: string } };
  return j.page;
}
