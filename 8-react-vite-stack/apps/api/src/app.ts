import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { clerkMiddleware } from '@clerk/express';
import { isClerkApiConfigured } from './lib/clerk-api-config.js';
import type { Env } from './lib/env.js';
import { errorHandler } from './middleware/errors.js';
import { createAdminRouter } from './routes/admin.js';
import { cartRouter } from './routes/cart.js';
import { createCheckoutRouter } from './routes/checkout.js';
import { createFormsRouter } from './routes/forms.js';
import { createMeRouter } from './routes/me.js';
import { publicRouter } from './routes/public.js';
import { createSeoRouter } from './routes/seo.js';
import { createClerkWebhookHandler } from './routes/webhooks/clerk.js';
import { createStripeWebhookHandler } from './routes/webhooks/stripe.js';
import { devClerkAuthStub } from './middleware/devClerkAuthStub.js';

export function createApp(env: Env) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(cookieParser());

  app.post(
    '/api/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    createStripeWebhookHandler(env)
  );
  app.post(
    '/api/webhooks/clerk',
    express.raw({ type: 'application/json' }),
    createClerkWebhookHandler(env)
  );

  app.use(express.json({ limit: '2mb' }));

  if (isClerkApiConfigured()) {
    app.use(clerkMiddleware());
  } else {
    app.use(devClerkAuthStub);
  }

  app.use('/api', publicRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/forms', createFormsRouter(env));
  app.use('/api/checkout', createCheckoutRouter(env));
  app.use('/api/me', createMeRouter(env));
  app.use('/api/admin', createAdminRouter(env));
  app.use('/api/seo', createSeoRouter(env));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
}
