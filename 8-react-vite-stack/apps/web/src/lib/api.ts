const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (init.token) {
    headers.set('Authorization', `Bearer ${init.token}`);
  }
  const { token, ...rest } = init;
  const res = await fetch(url, { ...rest, headers, credentials: 'include' });
  if (!res.ok) {
    let err: unknown = await res.text();
    try {
      err = JSON.parse(err as string);
    } catch {
      /* ignore */
    }
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
