import { Lucia } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { TimeSpan } from 'lucia'
import prisma from './prisma'

const adapter = new PrismaAdapter(prisma.session, prisma.user)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
  },
  sessionExpiresIn: new TimeSpan(30, 'd'),
  getUserAttributes: (attributes) => ({
    email: attributes.email,
    emailVerified: attributes.emailVerified,
    name: attributes.name,
  }),
})

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: {
      email: string
      emailVerified: boolean
      name: string | null
    }
  }
}
