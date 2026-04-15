import type { NextFunction, Request, Response } from 'express';

/**
 * Minimal `req.auth` so `getAuth(req)` from `@clerk/express` works without calling Clerk APIs.
 * Shape is compatible with `acceptsToken: "any"` (pass-through) in Clerk's getAuth.
 */
export function devClerkAuthStub(req: Request, _res: Response, next: NextFunction) {
  if ('auth' in req && req.auth) {
    return next();
  }

  Object.assign(req, {
    auth: () => ({
      userId: null,
      sessionId: null,
      sessionClaims: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      orgPermissions: null,
      sessionStatus: null,
      tokenType: 'session_token',
      getToken: async () => null,
    }),
  });
  next();
}
