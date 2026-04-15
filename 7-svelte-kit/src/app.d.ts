// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Session, User } from 'lucia';

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			user: User | null;
			session: Session | null;
			roles: string[];
			permissions: Set<string>;
		}
	}
}

export {};
