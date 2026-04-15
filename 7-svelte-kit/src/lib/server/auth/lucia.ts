import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db';
import * as schema from '../db/schema';

const adapter = new DrizzlePostgreSQLAdapter(db, schema.session, schema.user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		name: 'auth_session',
		attributes: {
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/'
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			emailVerified: attributes.emailVerified,
			name: attributes.name,
			avatarUrl: attributes.avatarUrl
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
			emailVerified: boolean;
			name: string | null;
			avatarUrl: string | null;
		};
		DatabaseSessionAttributes: Record<string, never>;
	}
}
