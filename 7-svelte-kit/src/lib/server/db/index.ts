import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { assertValidPostgresUrl } from './validate-connection-string';

const databaseUrl = assertValidPostgresUrl(env.DATABASE_URL);
const client = postgres(databaseUrl);

export const db = drizzle(client, { schema });
