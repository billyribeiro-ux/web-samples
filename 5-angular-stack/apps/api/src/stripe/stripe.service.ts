import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class StripeService {
  private readonly log = new Logger(StripeService.name);
  readonly stripe: InstanceType<typeof Stripe>;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
    private readonly mail: MailService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  async createCheckoutSession(opts: {
    successUrl: string;
    cancelUrl: string;
    lineItems: { price: string; quantity: number }[];
    customerEmail?: string;
    clientReferenceId?: string;
    mode: 'payment' | 'subscription';
  }) {
    return this.stripe.checkout.sessions.create({
      mode: opts.mode,
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      line_items: opts.lineItems as any,
      customer_email: opts.customerEmail,
      client_reference_id: opts.clientReferenceId,
    });
  }

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  /** Opens Stripe Customer Portal when the user has a stored Stripe customer id on a subscription. */
  async createBillingPortalForUser(userId: string, returnUrl: string) {
    const row = await this.prisma.subscription.findFirst({
      where: { userId, stripeCustomerId: { not: null } },
      orderBy: { updatedAt: 'desc' },
    });
    if (!row?.stripeCustomerId) {
      throw new BadRequestException(
        'No Stripe customer on file. Subscribe or complete a checkout first.',
      );
    }
    return this.createBillingPortalSession(row.stripeCustomerId, returnUrl);
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const whSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    let event: ReturnType<InstanceType<typeof Stripe>['webhooks']['constructEvent']>;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, whSecret);
    } catch (err) {
      this.log.error('Webhook signature failed', err);
      throw err;
    }

    const existing = await this.prisma.stripeWebhookEvent.findUnique({
      where: { id: event.id },
    });
    if (existing) {
      return { received: true, duplicate: true };
    }

    await this.prisma.stripeWebhookEvent.create({ data: { id: event.id } });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          mode?: string;
          id?: string;
          customer_email?: string | null;
          payment_intent?: string | { id?: string };
        };
        if (session.mode === 'payment' && session.id) {
          const pi =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id;
          await this.orders.markPaidBySession(session.id, pi);
          if (session.customer_email) {
            await this.mail.sendTransactional({
              to: session.customer_email,
              subject: 'Order confirmed',
              html: '<p>Thank you for your purchase.</p>',
            });
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as { id: string; status: string };
        this.log.log(`Subscription ${sub.id} status ${sub.status}`);
        break;
      }
      default:
        break;
    }

    return { received: true };
  }
}
