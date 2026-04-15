import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { SessionScope } from "@repo/db";
import { ApiError, errorBody } from "./lib/errors.js";
import { config } from "./lib/config.js";
import { loadSession } from "./middleware/session.js";
import type { AppEnv } from "./types.js";
import { authRoutes } from "./routes/auth.js";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";
import { accountRoutes } from "./routes/account.js";
import { formsRoutes } from "./routes/forms.js";
import { searchRoutes } from "./routes/search.js";
import { cartRoutes } from "./routes/cart.js";
import { checkoutRoutes } from "./routes/checkout.js";
import { membersRoutes } from "./routes/members.js";
import { stripeWebhookRoutes } from "./routes/stripe-webhook.js";

export const app = new Hono<AppEnv>();

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(errorBody(err), err.status as never);
  }
  return c.json(errorBody(err), 500 as never);
});

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [config.publicSiteUrl(), config.publicAdminUrl()],
    allowHeaders: ["Content-Type", "Authorization", "X-Guest-Cart"],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ ok: true, service: "platform-api" }));

app.route("/v1/auth", authRoutes);
app.route("/v1/public", publicRoutes);
app.route("/v1/admin", adminRoutes);
app.route("/v1/forms", formsRoutes);
app.route("/v1/search", searchRoutes);
app.route("/v1/stripe/webhook", stripeWebhookRoutes);

const accountApp = new Hono<AppEnv>();
accountApp.use("*", loadSession(SessionScope.MEMBER));
accountApp.route("/", accountRoutes);
app.route("/v1/account", accountApp);

app.route("/v1/cart", cartRoutes);
app.route("/v1/checkout", checkoutRoutes);
app.route("/v1/members", membersRoutes);
