import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

/** Transient: DB not listening yet (e.g. Docker still starting). Retrying helps. */
const CONNECT_ATTEMPTS = 15;
const CONNECT_DELAY_MS = 2000;

function isAuthDenied(err: unknown): err is Prisma.PrismaClientInitializationError {
  return err instanceof Prisma.PrismaClientInitializationError && err.errorCode === 'P1010';
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(PrismaService.name);

  async onModuleInit() {
    let lastError: unknown;
    for (let attempt = 1; attempt <= CONNECT_ATTEMPTS; attempt++) {
      try {
        await this.$connect();
        this.log.log('PostgreSQL connection established.');
        return;
      } catch (err) {
        lastError = err;
        if (isAuthDenied(err)) {
          this.log.error(
            [
              'PostgreSQL rejected DATABASE_URL (P1010: wrong user/password/database, or role cannot connect).',
              'Fix: ensure Docker Postgres is up (`pnpm run stack:up`) and credentials match docker-compose (user `platform`, password `platform`, DB `platform`, host port `5434`).',
              'If you changed POSTGRES_* in compose but kept an old volume, reset data: `docker compose down -v` then `pnpm run stack:up` again, then migrate + seed.',
              'Try 127.0.0.1 instead of localhost in DATABASE_URL if you see odd IPv6 issues.',
            ].join(' '),
          );
          throw err;
        }
        const msg = err instanceof Error ? err.message : String(err);
        this.log.warn(
          `Database not reachable (${msg}). Attempt ${attempt}/${CONNECT_ATTEMPTS}; retrying in ${CONNECT_DELAY_MS}ms…`,
        );
        if (attempt < CONNECT_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, CONNECT_DELAY_MS));
        }
      }
    }
    this.log.error(
      'Could not connect to PostgreSQL after retries. Start the database (`pnpm run stack:up`), then `pnpm exec prisma migrate deploy` and `pnpm run db:seed`.',
    );
    throw lastError;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
