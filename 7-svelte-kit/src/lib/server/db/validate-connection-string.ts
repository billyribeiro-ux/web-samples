/** Ensures DATABASE_URL parses as a URL (numeric port if present). Catches common placeholder mistakes. */
export function assertValidPostgresUrl(raw: string | undefined, label = 'DATABASE_URL'): string {
	const url = raw?.trim();
	if (!url) {
		throw new Error(
			`${label} is not set. Copy .env.example to .env and set a real Postgres URL (see comment there).`
		);
	}
	try {
		const u = new URL(url);
		if (!u.hostname) {
			throw new Error('missing hostname');
		}
		if (u.port && !/^\d+$/.test(u.port)) {
			throw new Error(`port must be numeric, got "${u.port}"`);
		}
	} catch (e) {
		const reason = e instanceof Error ? e.message : String(e);
		throw new Error(
			`${label} is not a valid connection URL (${reason}). ` +
				`Use a real host and numeric port, e.g. postgresql://postgres:postgres@127.0.0.1:5432/7sveltekit. ` +
				`Do not keep template text like @host:port/ — that breaks URL parsing.`
		);
	}
	return url;
}
