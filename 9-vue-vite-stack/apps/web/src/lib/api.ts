const base = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type ApiError = { error: string; code?: string };

export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    credentials: "include",
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const err = data as ApiError | null;
    throw new Error(err?.error ?? res.statusText);
  }
  return data as T;
}

export function getCsrf(): Promise<{ csrfToken: string | null }> {
  return api("/api/v1/auth/csrf");
}
