import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

class WebhookProcessingError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'WebhookProcessingError';
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
      return SubscriptionStatus.CANCELED;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    default:
      return SubscriptionStatus.INACTIVE;
  }
}

function extractCustomerId(event: Stripe.Event): string | null {
  const obj = event.data.object as Stripe.ApiList<Stripe.Subscription> | Stripe.Subscription | Stripe.Invoice | Stripe.Checkout.Session;
  if ('customer' in obj) {
    const c = (obj as { customer?: string | Stripe.Customer | Stripe.DeletedCustomer | null }).customer;
    if (typeof c === 'string') return c;
    if (c && 'id' in c) return (c as Stripe.Customer).id;
  }
  return null;
}

async function findSubscriptionByStripeRefs(
  stripeSubscriptionId?: string | null,
  stripeCustomerId?: string | null
) {
  if (!stripeSubscriptionId && !stripeCustomerId) return null;
  const where: Record<string, unknown> = {};
  const or: Array<Record<string, unknown>> = [];
  if (stripeSubscriptionId) or.push({ stripeSubscriptionId });
  if (stripeCustomerId) or.push({ stripeCustomerId });
  if (or.length > 0) where.OR = or;
  return prisma.subscription.findFirst({
    where,
    select: { userId: true },
  });
}

function getPeriodEndFromSubscription(sub: Stripe.Subscription): Date | null {
  return sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;
}

function getPeriodStartFromSubscription(sub: Stripe.Subscription): Date | null {
  return sub.current_period_start
    ? new Date(sub.current_period_start * 1000)
    : null;
}

function getCanceledAtFromSubscription(sub: Stripe.Subscription): Date | null {
  return sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;
}

async function upsertSubscriptionFromStripeSub(
  stripeSub: Stripe.Subscription,
  overrideUserId?: string
): Promise<void> {
  const stripeSubscriptionId = stripeSub.id;
  const customerFromSub =
    typeof stripeSub.customer === 'string'
      ? stripeSub.customer
      : stripeSub.customer?.id ?? null;

  const priceId = stripeSub.items.data[0]?.price.id ?? null;
  const mappedStatus = mapStripeStatus(stripeSub.status);
  let finalStatus = mappedStatus;
  if (stripeSub.cancel_at_period_end && stripeSub.status === 'active') {
    finalStatus = SubscriptionStatus.ACTIVE;
  }
  const currentPeriodEnd = getPeriodEndFromSubscription(stripeSub);
  const currentPeriodStart = getPeriodStartFromSubscription(stripeSub);
  const cancelAtPeriodEnd = !!stripeSub.cancel_at_period_end;
  const canceledAt = getCanceledAtFromSubscription(stripeSub);

  if (overrideUserId) {
    await prisma.subscription.upsert({
      where: { userId: overrideUserId },
      create: {
        userId: overrideUserId,
        stripeCustomerId: customerFromSub ?? undefined,
        stripeSubscriptionId,
        stripePriceId: priceId,
        subscriptionStatus: finalStatus,
        currentPeriodEnd,
        currentPeriodStart,
        cancelAtPeriodEnd,
        canceledAt,
      },
      update: {
        stripeCustomerId: customerFromSub ?? undefined,
        stripeSubscriptionId,
        stripePriceId: priceId,
        subscriptionStatus: finalStatus,
        currentPeriodEnd,
        currentPeriodStart,
        cancelAtPeriodEnd,
        canceledAt,
      },
    });
    return;
  }

  const existing = await findSubscriptionByStripeRefs(
    stripeSubscriptionId,
    customerFromSub
  );
  if (!existing) {
    console.warn(
      `customer.subscription: nessun abbonamento DB per stripeSubscriptionId=${stripeSubscriptionId} customer=${customerFromSub}`
    );
    return;
  }

  await prisma.subscription.update({
    where: { userId: existing.userId },
    data: {
      stripeSubscriptionId,
      stripeCustomerId: customerFromSub ?? undefined,
      stripePriceId: priceId,
      subscriptionStatus: finalStatus,
      currentPeriodEnd,
      currentPeriodStart,
      cancelAtPeriodEnd,
      canceledAt,
    },
  });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const stripeCustomerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;
  const userId = session.metadata?.userId;

  if (!userId) {
    throw new WebhookProcessingError(
      'checkout.session.completed: userId mancante nei metadata',
      400
    );
  }

  if (!stripeCustomerId) {
    throw new WebhookProcessingError(
      'checkout.session.completed: stripeCustomerId mancante',
      400
    );
  }

  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

  let stripePriceId: string | null = null;
  let currentPeriodEnd: Date | null = null;
  let currentPeriodStart: Date | null = null;

  if (stripeSubscriptionId) {
    const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    stripePriceId = sub.items.data[0]?.price.id ?? null;
    currentPeriodEnd = getPeriodEndFromSubscription(sub);
    currentPeriodStart = getPeriodStartFromSubscription(sub);
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
      stripePriceId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
      currentPeriodStart,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId: stripeSubscriptionId ?? undefined,
      stripePriceId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
      currentPeriodStart,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    },
  });
}

async function handleCustomerSubscriptionCreated(event: Stripe.Event) {
  const stripeSub = event.data.object as Stripe.Subscription;
  await upsertSubscriptionFromStripeSub(stripeSub);
}

async function handleCustomerSubscriptionUpdated(event: Stripe.Event) {
  const stripeSub = event.data.object as Stripe.Subscription;
  await upsertSubscriptionFromStripeSub(stripeSub);
}

async function handleCustomerSubscriptionDeleted(event: Stripe.Event) {
  const stripeSub = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = stripeSub.id;
  const stripeCustomerId = extractCustomerId(event);

  const subscription = await findSubscriptionByStripeRefs(
    stripeSubscriptionId,
    stripeCustomerId
  );

  if (!subscription) {
    console.warn(
      'customer.subscription.deleted: abbonamento non trovato per stripeSubscriptionId:',
      stripeSubscriptionId
    );
    return;
  }

  const canceledAt = stripeSub.canceled_at
    ? new Date(stripeSub.canceled_at * 1000)
    : new Date();
  const currentPeriodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : canceledAt;

  await prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      subscriptionStatus: SubscriptionStatus.CANCELED,
      currentPeriodEnd,
      cancelAtPeriodEnd: true,
      canceledAt,
    },
  });
}

async function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  const stripeCustomerId = extractCustomerId(event);

  if (!stripeSubscriptionId && !stripeCustomerId) {
    return;
  }

  const subscription = await findSubscriptionByStripeRefs(
    stripeSubscriptionId,
    stripeCustomerId
  );

  if (!subscription) {
    return;
  }

  const now = new Date();
  const subRecord = await prisma.subscription.findUnique({
    where: { userId: subscription.userId },
    select: { subscriptionStatus: true, currentPeriodEnd: true },
  });

  const isExpired =
    subRecord?.currentPeriodEnd && new Date(subRecord.currentPeriodEnd) < now;

  const shouldReactivate =
    subRecord?.subscriptionStatus !== SubscriptionStatus.ACTIVE || isExpired;

  if (shouldReactivate) {
    let currentPeriodEnd: Date | null = subRecord?.currentPeriodEnd ?? null;

    if (stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        if (sub.current_period_end) {
          currentPeriodEnd = new Date(sub.current_period_end * 1000);
        }
      } catch (err) {
        console.error(
          'invoice.paid: errore nel recupero subscription da Stripe:',
          err
        );
      }
    }

    await prisma.subscription.update({
      where: { userId: subscription.userId },
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        currentPeriodEnd,
      },
    });
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  const stripeCustomerId = extractCustomerId(event);

  if (!stripeSubscriptionId && !stripeCustomerId) {
    return;
  }

  const subscription = await findSubscriptionByStripeRefs(
    stripeSubscriptionId,
    stripeCustomerId
  );

  if (!subscription) {
    return;
  }

  await prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      subscriptionStatus: SubscriptionStatus.PAST_DUE,
    },
  });
}

async function handleInvoicePaymentActionRequired(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  const stripeCustomerId = extractCustomerId(event);

  if (!stripeSubscriptionId && !stripeCustomerId) {
    return;
  }

  const subscription = await findSubscriptionByStripeRefs(
    stripeSubscriptionId,
    stripeCustomerId
  );

  if (!subscription) {
    return;
  }

  await prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      subscriptionStatus: SubscriptionStatus.PAST_DUE,
    },
  });
}

async function handleInvoiceFinalizationFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeSubscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id ?? null;
  const stripeCustomerId = extractCustomerId(event);

  if (!stripeSubscriptionId && !stripeCustomerId) {
    return;
  }

  const subscription = await findSubscriptionByStripeRefs(
    stripeSubscriptionId,
    stripeCustomerId
  );

  if (!subscription) {
    return;
  }

  await prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      subscriptionStatus: SubscriptionStatus.PAST_DUE,
    },
  });
}

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { received: false, error: 'Manca firma Stripe' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET non configurato');
    return NextResponse.json(
      { received: false, error: 'Configurazione webhook mancante' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Errore verifica firma webhook';
    console.error('Stripe webhook signature error:', message);
    return NextResponse.json(
      { received: false, error: message },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      case 'customer.subscription.created':
        await handleCustomerSubscriptionCreated(event);
        break;
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      case 'invoice.payment_action_required':
        await handleInvoicePaymentActionRequired(event);
        break;
      case 'invoice.finalization_failed':
        await handleInvoiceFinalizationFailed(event);
        break;
      default:
        console.info(`Stripe webhook evento non gestito: ${event.type}`);
        break;
    }
  } catch (err) {
    const message =
      err instanceof WebhookProcessingError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Errore sconosciuto';
    const statusCode =
      err instanceof WebhookProcessingError ? err.statusCode : 500;
    console.error(
      `Stripe webhook ERRORE processamento evento ${event.type}:`,
      err
    );
    return NextResponse.json(
      { received: false, error: message, event: event.type },
      { status: statusCode }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
