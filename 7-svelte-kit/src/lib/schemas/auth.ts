import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8, 'Use at least 8 characters'),
	name: z.string().trim().min(1, 'Name is required').max(255)
});

export const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
	email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8, 'Use at least 8 characters')
});
