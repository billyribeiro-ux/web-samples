import { defineConfig } from 'drizzle-kit';
import { assertValidPostgresUrl } from './src/lib/server/db/validate-connection-string';

const databaseUrl = assertValidPostgresUrl(process.env.DATABASE_URL, 'DATABASE_URL (drizzle-kit)');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true
});
