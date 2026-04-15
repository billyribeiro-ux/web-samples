import { defineMiddleware } from 'astro:middleware';

import { auth } from '@/lib/auth';
import { canAccessAdmin, getRoleSlugsForUser } from '@/lib/rbac';

export const onRequest = defineMiddleware(async (context, next) => {
  const sessionData = await auth.api.getSession({
    headers: context.request.headers,
  });

  if (sessionData) {
    context.locals.user = sessionData.user;
    context.locals.session = sessionData.session;
    context.locals.roles = await getRoleSlugsForUser(sessionData.user.id);
  } else {
    context.locals.user = null;
    context.locals.session = null;
    context.locals.roles = [];
  }

  const path = context.url.pathname;

  if (path.startsWith('/admin')) {
    if (!context.locals.user || !canAccessAdmin(context.locals.roles)) {
      return context.redirect('/login?next=' + encodeURIComponent(path));
    }
  }

  if (
    path.startsWith('/account') ||
    path.startsWith('/members') ||
    path.startsWith('/library')
  ) {
    if (!context.locals.user) {
      return context.redirect('/login?next=' + encodeURIComponent(path));
    }
  }

  return next();
});
