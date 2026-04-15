export function siteUrl(): string {
  return import.meta.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';
}

export function absoluteUrl(path: string): string {
  const base = siteUrl().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
