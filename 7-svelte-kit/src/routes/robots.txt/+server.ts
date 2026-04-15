import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const origin = (publicEnv.PUBLIC_APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
	const body = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
