import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import pino from "pino";
import type { Env } from "./lib/env.js";
import { attachSession } from "./middleware/session.js";
import { requireCsrf } from "./middleware/requireCsrf.js";
import { HttpError, isHttpError } from "./lib/errors.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { publicRouter } from "./routes/public.js";
import { formsRouter } from "./routes/forms.js";
import { searchRouter } from "./routes/search.js";
import { cartRouter } from "./routes/cart.js";
import { checkoutRouter } from "./routes/checkout.js";
import { accountRouter } from "./routes/account.js";
import { adminRouter } from "./routes/admin.js";
import { webhooksStripeRouter } from "./routes/webhooksStripe.js";
import { seoRouter } from "./routes/seo.js";
import { membersRouter } from "./routes/members.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

export function createApp(env: Env) {
  const app = express();

  app.use((req, _res, next) => {
    req.env = env;
    next();
  });

  app.use(
    pinoHttp({
      logger,
      autoLogging: env.NODE_ENV !== "test",
    })
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.use("/api/v1/webhooks/stripe", express.raw({ type: "application/json" }), webhooksStripeRouter);

  app.use(express.json({ limit: "1mb" }));

  app.use(attachSession);

  const apiLimiter = rateLimit({ windowMs: 60_000, max: 300 });
  const authLimiter = rateLimit({ windowMs: 60_000, max: 30 });
  const formLimiter = rateLimit({ windowMs: 60_000, max: 20 });

  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  app.use("/api/v1/seo", seoRouter);

  app.use("/api/v1", apiLimiter);
  app.use("/api/v1/auth", authLimiter, authRouter);
  app.use("/api/v1/me", requireCsrf, meRouter);
  app.use("/api/v1/public", publicRouter);
  app.use("/api/v1/forms", formLimiter, formsRouter);
  app.use("/api/v1/search", searchRouter);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/checkout", requireCsrf, checkoutRouter);
  app.use("/api/v1/account", requireCsrf, accountRouter);
  app.use("/api/v1/members", requireCsrf, membersRouter);
  app.use("/api/v1/admin", requireCsrf, adminRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (isHttpError(err)) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    logger.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
