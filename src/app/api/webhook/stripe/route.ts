import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const stripeCustomerId = session.customer as string;
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('checkout.session.completed: userId mancante nei metadata');
    return;
  }

  if (!stripeCustomerId) {
    console.error('checkout.session.completed: stripeCustomerId mancante');
    return;
  }

  const stripeSubscriptionId = session.subscription as string;
  let stripePriceId: string | null = null;
  let currentPeriodEnd: Date | null = null;

  if (stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      stripePriceId = sub.items.data[0]?.price.id ?? null;
      currentPeriodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;
    } catch (err) {
      console.error(
        'checkout.session.completed: errore nel recupero subscription da Stripe:',
        err
      );
    }
  }

  if (!currentPeriodEnd && session.expires_at) {
    currentPeriodEnd = new Date(session.expires_at * 1000);
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
    },
    update: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      currentPeriodEnd,
    },
  });
}

async function handleCustomerSubscriptionUpdated(event: Stripe.Event) {
  const stripeSub = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = stripeSub.id;
  const stripeCustomerId = stripeSub.customer as string;

  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId },
      ],
    },
    select: { userId: true },
  });

  if (!subscription) {
    console.warn(
      'customer.subscription.updated: abbonamento non trovato per stripeSubscriptionId:',
      stripeSubscriptionId
    );
    return;
  }

  const mappedStatus = mapStripeStatus(stripeSub.status);
  let finalStatus = mappedStatus;

  if (stripeSub.cancel_at_period_end && stripeSub.status === 'active') {
    finalStatus = SubscriptionStatus.ACTIVE;
  }

  const stripePriceId = stripeSub.items.data[0]?.price.id ?? null;
  const currentPeriodEnd = stripeSub.current_period_end
    ? new Date(stripeSub.current_period_end * 1000)
    : null;

  await prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      stripeSubscriptionId,
      stripeCustomerId,
      stripePriceId,
      subscriptionStatus: finalStatus,
      currentPeriodEnd,
    },
  });
}

async function handleCustomerSubscriptionDeleted(event: Stripe.Event) {
  const stripeSub = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = stripeSub.id;
  const stripeCustomerId = stripeSub.customer as string;

  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId },
      ],
    },
    select: { userId: true },
  });

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
    },
  });
}

async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeSubscriptionId = invoice.subscription as string;
  const stripeCustomerId = invoice.customer as string;

  if (!stripeSubscriptionId && !stripeCustomerId) {
    console.warn('invoice.payment_failed: nessun riferimento ad abbonamento');
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId },
      ],
    },
    select: { userId: true },
  });

  if (!subscription) {
    console.warn(
      'invoice.payment_failed: abbonamento non trovato per stripeSubscriptionId:',
      stripeSubscriptionId
    );
    return;
  }

  await prisma.subscription.update({
    where: { userId: subscription.userId },
    data: {
      subscriptionStatus: SubscriptionStatus.PAST_DUE,
    },
  });
}

async function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeSubscriptionId = invoice.subscription as string;
  const stripeCustomerId = invoice.customer as string;

  if (!stripeSubscriptionId && !stripeCustomerId) {
    console.warn('invoice.paid: nessun riferimento ad abbonamento');
    return;
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId },
      ],
    },
    select: { userId: true, subscriptionStatus: true, currentPeriodEnd: true },
  });

  if (!subscription) {
    console.warn(
      'invoice.paid: abbonamento non trovato per stripeSubscriptionId:',
      stripeSubscriptionId
    );
    return;
  }

  const now = new Date();
  const isExpired =
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd) < now;

  const shouldReactivate =
    subscription.subscriptionStatus !== SubscriptionStatus.ACTIVE || isExpired;

  if (shouldReactivate) {
    let currentPeriodEnd: Date | null = subscription.currentPeriodEnd;

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

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { received: false, error: 'Manca firma Stripe' },
      { status: 400 }
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
      case 'customer.subscription.updated':
        await handleCustomerSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleCustomerSubscriptionDeleted(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event);
        break;
      default:
        console.info(`Stripe webhook evento non gestito: ${event.type}`);
        break;
    }
  } catch (err) {
    console.error(
      `Stripe webhook errore durante gestione evento ${event.type}:`,
      err
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
