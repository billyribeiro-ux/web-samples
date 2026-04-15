import { auth } from '@/lib/auth';
import { canAccessAdmin, getRoleSlugsForUser } from '@/lib/rbac';

export async function requireUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return { ok: false as const, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) };
  }
  return { ok: true as const, user: session.user, session: session.session };
}

export async function requireAdmin(request: Request) {
  const r = await requireUser(request);
  if (!r.ok) return r;
  const roles = await getRoleSlugsForUser(r.user.id);
  if (!canAccessAdmin(roles)) {
    return { ok: false as const, response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) };
  }
  return { ok: true as const, user: r.user, roles };
}
