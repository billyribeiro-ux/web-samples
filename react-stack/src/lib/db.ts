import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Run a Prisma query with a fallback when the DB is unreachable or permissions
 * deny access (dev-friendly; production should fix DATABASE_URL / grants).
 */
export async function withDbFallback<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[db] Query failed — using fallback. Check DATABASE_URL, Postgres is running, and migrations are applied.",
      );
      console.warn(err);
    }
    return fallback;
  }
}

export default prisma;
