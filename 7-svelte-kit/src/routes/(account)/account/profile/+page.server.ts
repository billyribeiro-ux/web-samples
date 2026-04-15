import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireLogin } from '$lib/server/rbac/guards';
import { hashPassword, verifyPassword } from '$lib/server/auth/password';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const profileSchema = z.object({
	name: z.string().trim().min(1).max(255)
});

const passwordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8)
});

export const load: PageServerLoad = async (event) => {
	requireLogin(event);
	return {};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const u = requireLogin(event);
		const fd = await event.request.formData();
		const parsed = profileSchema.safeParse({ name: fd.get('name') });
		if (!parsed.success) return fail(400, { profileError: 'Invalid name' });
		await db
			.update(user)
			.set({ name: parsed.data.name, updatedAt: new Date() })
			.where(eq(user.id, u.id));
		return { profileOk: true };
	},
	changePassword: async (event) => {
		const u = requireLogin(event);
		const fd = await event.request.formData();
		const parsed = passwordSchema.safeParse({
			currentPassword: fd.get('currentPassword'),
			newPassword: fd.get('newPassword')
		});
		if (!parsed.success) return fail(400, { passwordError: 'Password must be at least 8 characters' });

		const [row] = await db.select().from(user).where(eq(user.id, u.id)).limit(1);
		if (!row?.hashedPassword) return fail(400, { passwordError: 'Password login not enabled' });
		const ok = await verifyPassword(row.hashedPassword, parsed.data.currentPassword);
		if (!ok) return fail(400, { passwordError: 'Current password is incorrect' });

		await db
			.update(user)
			.set({ hashedPassword: await hashPassword(parsed.data.newPassword), updatedAt: new Date() })
			.where(eq(user.id, u.id));
		return { passwordOk: true };
	}
};
