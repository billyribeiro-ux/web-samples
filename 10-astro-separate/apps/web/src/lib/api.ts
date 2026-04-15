const base = () => (import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base()}${p}`;
}

export async function apiServerFetch(request: Request, path: string, init: RequestInit = {}) {
  const cookie = request.headers.get("cookie");
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (cookie) headers.set("Cookie", cookie);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(apiUrl(path), { ...init, headers });
}
