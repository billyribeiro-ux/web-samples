import { hash, verify } from '@node-rs/argon2';

export async function hashPassword(plain: string): Promise<string> {
	return hash(plain, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

export async function verifyPassword(hashStr: string, plain: string): Promise<boolean> {
	try {
		return await verify(hashStr, plain);
	} catch {
		return false;
	}
}
