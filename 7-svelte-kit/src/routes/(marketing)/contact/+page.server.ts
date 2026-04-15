import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { formSubmission } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { trackServerEvent } from '$lib/server/analytics';
import type { Actions } from './$types';

const schema = z.object({
	name: z.string().trim().min(1).max(200),
	email: z.string().email(),
	message: z.string().trim().min(10).max(5000)
});

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const parsed = schema.safeParse({
			name: fd.get('name'),
			email: fd.get('email'),
			message: fd.get('message')
		});
		if (!parsed.success) {
			return fail(400, { message: 'Please check the form fields.' });
		}
		await db.insert(formSubmission).values({
			id: nanoid(),
			formType: 'contact',
			payload: parsed.data
		});
		await trackServerEvent('form_submit', { form: 'contact' });
		return { ok: true as const };
	}
};
