import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

loadEnv({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

import express from "express";
import "express-async-errors";

import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import { loadConfig } from "./config.js";
import { prisma } from "./lib/prisma.js";
import { createPrismaSessionStore } from "./lib/sessionStore.js";
import { csrfProtection, ensureCsrfSession } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { postsRouter } from "./routes/posts.js";
import { pagesRouter } from "./routes/pages.js";
import { taxonomyRouter } from "./routes/taxonomy.js";
import { productsRouter } from "./routes/products.js";
import { checkoutRouter } from "./routes/checkout.js";
import { mediaRouter } from "./routes/media.js";
import { formsRouter } from "./routes/forms.js";
import { searchRouter } from "./routes/search.js";
import { ordersRouter } from "./routes/orders.js";
import { favoritesRouter } from "./routes/favorites.js";
import { settingsRouter } from "./routes/settings.js";
import { adminRouter } from "./routes/admin.js";
import { gatedRouter } from "./routes/gated.js";
import { usersRouter } from "./routes/users.js";
import { seoRouter } from "./routes/seo.js";
import { plansRouter } from "./routes/plans.js";
import { stripeWebhookRouter } from "./routes/webhooks/stripe.js";

const env = loadConfig();
const app = express();
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
const devOrigins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"];
app.use(
  cors({
    origin:
      env.NODE_ENV === "development"
        ? [env.CORS_ORIGIN, ...devOrigins].filter((v, i, a) => a.indexOf(v) === i)
        : env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use("/api/v1/webhooks/stripe", stripeWebhookRouter(env));
app.use(express.json({ limit: "2mb" }));
app.use(
  session({
    name: "sid",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: createPrismaSessionStore(prisma),
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

const api = express.Router();
api.use(ensureCsrfSession);
api.use((req, res, next) => {
  if (req.path.startsWith("/webhooks")) {
    next();
    return;
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    csrfProtection(req, res, next);
    return;
  }
  next();
});

api.use("/auth", authRouter(env));
api.use("/posts", postsRouter());
api.use("/pages", pagesRouter());
api.use("/taxonomy", taxonomyRouter());
api.use("/products", productsRouter());
api.use("/checkout", checkoutRouter(env));
api.use("/media", mediaRouter(env));
api.use("/forms", formsRouter(env));
api.use("/search", searchRouter());
api.use("/orders", ordersRouter());
api.use("/favorites", favoritesRouter());
api.use("/settings", settingsRouter());
api.use("/admin", adminRouter());
api.use("/gated", gatedRouter());
api.use("/users", usersRouter());
api.use("/seo", seoRouter(env));
api.use("/plans", plansRouter());

app.use("/api/v1", api);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  console.error(err);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use. Stop the other process or set PORT in .env.`);
  }
  process.exit(1);
});

function shutdown(signal: string) {
  console.log(`${signal}: closing HTTP server…`);
  server.close((closeErr) => {
    if (closeErr) console.error(closeErr);
    void prisma.$disconnect().finally(() => process.exit(closeErr ? 1 : 0));
  });
  setTimeout(() => {
    console.error("Shutdown timed out; exiting.");
    process.exit(1);
  }, 10_000).unref();
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
