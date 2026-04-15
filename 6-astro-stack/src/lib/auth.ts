import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';
const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < 32) {
  console.warn('BETTER_AUTH_SECRET should be at least 32 characters in production.');
}

export const auth = betterAuth({
  baseURL,
  secret: secret ?? 'dev-only-secret-min-32-chars-replace-me!!',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === 'production' && Boolean(process.env.RESEND_API_KEY),
    autoSignIn: true,
  },
  emailVerification: {
    sendOnSignUp: process.env.NODE_ENV === 'production' && Boolean(process.env.RESEND_API_KEY),
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        html: `<p>Hi ${user.name},</p><p><a href="${url}">Verify your email</a></p>`,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  rateLimit: {
    storage: 'database',
  },
});

export type Session = typeof auth.$Infer.Session;
