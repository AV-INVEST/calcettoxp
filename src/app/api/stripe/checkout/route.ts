import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { z } from 'zod';
import { hasActivePro } from '@/lib/entitlements';
import { getAppBaseUrl } from '@/lib/app-url';

const planSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
});

const APP_URL = getAppBaseUrl();

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.userId) {
    console.error('[CHECKOUT] 401 missing_userId', JSON.stringify({
      stage: 'auth_check',
      sessionPresent: !!session,
      userPresent: !!session?.user,
    }));
    return NextResponse.json(
      { ok: false, error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  const userId = session.user.userId;
  let requestedPlan: 'monthly' | 'yearly' | undefined;

  try {
    const body = await req.json();
    console.info('[CHECKOUT] request_in', JSON.stringify({
      stage: 'parse_body',
      plan: (body as { plan?: unknown })?.plan === 'monthly' ? 'monthly'
        : (body as { plan?: unknown })?.plan === 'yearly' ? 'yearly'
        : (body as { plan?: unknown })?.plan == null ? 'null' : 'other',
      planType: typeof (body as { plan?: unknown })?.plan,
    }));
    const parsed = planSchema.parse(body);
    requestedPlan = parsed.plan;

    const priceEnvMonthly = process.env.STRIPE_PRICE_PRO_MONTHLY;
    const priceEnvYearly = process.env.STRIPE_PRICE_PRO_YEARLY;
    const priceId =
      requestedPlan === 'monthly' ? priceEnvMonthly : priceEnvYearly;

    if (!priceId) {
      console.error('[CHECKOUT] 400 CHECKOUT_MISSING_PRICE', JSON.stringify({
        stage: 'validate_price_env',
        plan: requestedPlan,
        monthlyDefined: typeof priceEnvMonthly === 'string' && priceEnvMonthly.length > 0,
        yearlyDefined: typeof priceEnvYearly === 'string' && priceEnvYearly.length > 0,
        monthlyPrefix: typeof priceEnvMonthly === 'string' && priceEnvMonthly.length > 0 ? priceEnvMonthly.slice(0, 6) + '…' : 'N/A',
        yearlyPrefix: typeof priceEnvYearly === 'string' && priceEnvYearly.length > 0 ? priceEnvYearly.slice(0, 6) + '…' : 'N/A',
      }));
      return NextResponse.json(
        { ok: false, error: 'Prezzo non valido o configurazione mancante', debugCode: 'CHECKOUT_MISSING_PRICE' },
        { status: 400 }
      );
    }

    const [user, playerProfile, existingSubscription] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      }),
      prisma.playerProfile.findUnique({
        where: { userId },
        select: { id: true, nickname: true },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        select: {
          id: true,
          stripeCustomerId: true,
          subscriptionStatus: true,
          currentPeriodEnd: true,
        },
      }),
    ]);

    if (!user) {
      console.error('[CHECKOUT] 400 CHECKOUT_USER_NOT_FOUND', JSON.stringify({
        stage: 'load_user',
        userIdPrefix: userId.slice(0, 8) + '…',
      }));
      return NextResponse.json(
        { ok: false, error: 'Utente non trovato', debugCode: 'CHECKOUT_USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    if (existingSubscription && hasActivePro(existingSubscription)) {
      return NextResponse.json(
        { ok: false, error: 'Abbonamento PRO già attivo' },
        { status: 409 }
      );
    }

    let stripeCustomerId = existingSubscription?.stripeCustomerId ?? null;

    if (!stripeCustomerId) {
      const customerEmail = user.email ?? undefined;
      const customerName =
        user.name ?? playerProfile?.nickname ?? `Utente ${userId}`;

      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          userId,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId,
        },
        update: {
          stripeCustomerId,
        },
      });
    }

    const successUrl = `${APP_URL}/dashboard?pro=success`;
    const cancelUrl = `${APP_URL}/pricing?canceled=1`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { ok: false, error: 'Impossibile creare sessione di checkout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: checkoutSession.url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[CHECKOUT] 400 CHECKOUT_INVALID_PLAN', JSON.stringify({
        stage: 'validate_plan_zod',
        issues: error.issues.map(({ code, path, message }) => ({
          code,
          path: path.join('.'),
          message,
        })),
      }));
      return NextResponse.json(
        { ok: false, error: 'Piano non valido', debugCode: 'CHECKOUT_INVALID_PLAN', issues: error.issues },
        { status: 400 }
      );
    }

    const stripeAny = error as {
      type?: string;
      message?: string;
      code?: string;
      requestId?: string;
      statusCode?: number;
      raw?: unknown;
    };

    const isStripeError =
      !!stripeAny.type &&
      (stripeAny.type.startsWith('Stripe') ||
        !!stripeAny.requestId ||
        !!stripeAny.code);

    const logPayload: Record<string, unknown> = {
      ok: false,
      stage: 'checkout-session-create',
      plan: requestedPlan,
    };

    if (isStripeError) {
      Object.assign(logPayload, {
        stripeType: stripeAny.type,
        stripeMessage: stripeAny.message,
        stripeCode: stripeAny.code,
        stripeRequestId: stripeAny.requestId,
        stripeStatus: stripeAny.statusCode,
      });
      console.error('Stripe checkout error (Stripe):', JSON.stringify(logPayload));
    } else {
      Object.assign(logPayload, {
        name: (error as { name?: string })?.name ?? 'Error',
        message: (error as { message?: string })?.message ?? String(error),
        stack: (error as { stack?: string })?.stack,
      });
      console.error('Stripe checkout error (generic):', JSON.stringify(logPayload));
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Errore interno del server',
        ...(isStripeError ? {
          debugCode: stripeAny.code ?? undefined,
          requestId: stripeAny.requestId ?? undefined,
          stripeType: stripeAny.type ?? undefined,
        } : {}),
      },
      { status: isStripeError ? (stripeAny.statusCode ?? 500) : 500 }
    );
  }
}
