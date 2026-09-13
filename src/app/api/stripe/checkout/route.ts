import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { z } from 'zod';
import { hasActivePro } from '@/lib/entitlements';
import { getAppBaseUrl } from '@/lib/app-url';
import { SubscriptionStatus } from '@prisma/client';

const planSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
});

const APP_URL = getAppBaseUrl();

const NON_TERMINAL_STRIPE_STATUSES: ReadonlyArray<string> = [
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'incomplete',
  'paused',
] as const;

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

    const checkoutSessionOrFailure = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SELECT "id" FROM "User" WHERE "id" = $1::text FOR UPDATE`,
        userId as any
      );

      const [user, playerProfile, existingSubscription] = await Promise.all([
        tx.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true },
        }),
        tx.playerProfile.findUnique({
          where: { userId },
          select: { id: true, nickname: true, username: true },
        }),
        tx.subscription.findUnique({
          where: { userId },
          select: {
            id: true,
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            subscriptionStatus: true,
            currentPeriodEnd: true,
          },
        }),
      ]);

      if (!user) {
        return { type: 'error' as const, status: 400, error: 'Utente non trovato', debugCode: 'CHECKOUT_USER_NOT_FOUND' };
      }

      if (existingSubscription && hasActivePro(existingSubscription)) {
        return { type: 'conflict' as const };
      }

      const customerEmail = user.email ?? undefined;
      const customerName =
        user.name ?? playerProfile?.nickname ?? `Utente ${userId}`;
      const customerUsername =
        playerProfile?.username ?? playerProfile?.nickname ?? undefined;
      const planLabel = requestedPlan;

      const enrichedMetadata = {
        userId,
        name: customerName,
        email: customerEmail ?? '',
        username: customerUsername ?? '',
        plan: planLabel ?? '',
      };

      let stripeCustomerId = existingSubscription?.stripeCustomerId ?? null;

      if (!stripeCustomerId) {
        const idempotencyKey = `cust_${userId}_${planLabel}`;
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: enrichedMetadata,
        }, {
          idempotencyKey,
        });

        stripeCustomerId = customer.id;

        await tx.subscription.upsert({
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

      let remoteHasNonTerminal = false;
      try {
        const remoteSubs = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 20,
        });
        for (const s of remoteSubs.data) {
          if (NON_TERMINAL_STRIPE_STATUSES.includes(s.status)) {
            remoteHasNonTerminal = true;
            console.warn('[CHECKOUT] 409 remote_non_terminal_sub', JSON.stringify({
              stage: 'stripe_remote_check_tx',
              userIdPrefix: userId.slice(0, 8) + '…',
              stripeCustomerIdPrefix: stripeCustomerId.slice(0, 10) + '…',
              status: s.status,
              subIdPrefix: s.id.slice(0, 14) + '…',
            }));
            break;
          }
        }
      } catch (remoteErr) {
        const rErr = remoteErr as { message?: string; code?: string };
        console.error('[CHECKOUT] 503 remote_sub_list_failed', JSON.stringify({
          stage: 'stripe_remote_check_tx',
          userIdPrefix: userId.slice(0, 8) + '…',
          message: rErr.message,
          code: rErr.code,
        }));
        return {
          type: 'error' as const,
          status: 503,
          error: 'Impossibile avviare il checkout in questo momento. Riprova tra qualche secondo.',
          debugCode: 'CHECKOUT_REMOTE_SUB_FAIL',
        };
      }

      if (remoteHasNonTerminal) {
        return { type: 'conflict' as const };
      }

      try {
        await stripe.customers.update(stripeCustomerId, {
          metadata: enrichedMetadata,
        });
      } catch (updErr) {
        const uErr = updErr as { message?: string };
        console.warn('[CHECKOUT] customer_update_warn', JSON.stringify({
          stage: 'customer_update_tx',
          userIdPrefix: userId.slice(0, 8) + '…',
          message: uErr.message,
        }));
      }

      const expiredSessions: string[] = [];
      let listSessionsFailed = false;
      try {
        let nextCursor: string | undefined;
        do {
          const openSessions = await stripe.checkout.sessions.list({
            customer: stripeCustomerId,
            status: 'open',
            limit: 100,
            starting_after: nextCursor,
          });
          for (const s of openSessions.data) {
            if (s.mode !== 'subscription') continue;
            const sUserId = s.metadata?.userId;
            const sApp = s.metadata?.plan;
            const isCalcettoApp =
              !!sUserId ||
              (s.metadata && typeof s.metadata.userId === 'string') ||
              !!sApp;
            if (!isCalcettoApp) continue;
            try {
              await stripe.checkout.sessions.expire(s.id);
              expiredSessions.push(s.id);
            } catch (expErr) {
              const ex = expErr as { message?: string };
              console.error('[CHECKOUT] 503 session_expire_failed', JSON.stringify({
                stage: 'open_sessions_expire',
                sessionId: s.id.slice(0, 14) + '…',
                msg: ex.message,
              }));
              return {
                type: 'error' as const,
                status: 503,
                error: 'Impossibile avviare il checkout in questo momento. Riprova tra qualche secondo.',
                debugCode: 'CHECKOUT_SESSION_EXPIRE_FAIL',
              };
            }
          }
          nextCursor = openSessions.has_more
            ? (openSessions.data[openSessions.data.length - 1]?.id as string)
            : undefined;
        } while (nextCursor);

        if (expiredSessions.length > 0) {
          console.info('[CHECKOUT] expired_open_sessions', JSON.stringify({
            stage: 'open_sessions_expire',
            userIdPrefix: userId.slice(0, 8) + '…',
            count: expiredSessions.length,
            ids: expiredSessions.map((id) => id.slice(0, 14) + '…'),
          }));
        }
      } catch (listErr) {
        listSessionsFailed = true;
        const le = listErr as { message?: string; code?: string };
        console.error('[CHECKOUT] 503 open_sessions_list_failed', JSON.stringify({
          stage: 'open_sessions_enumerate',
          msg: le.message,
          code: le.code,
        }));
        return {
          type: 'error' as const,
          status: 503,
          error: 'Impossibile avviare il checkout in questo momento. Riprova tra qualche secondo.',
          debugCode: 'CHECKOUT_SESSION_LIST_FAIL',
        };
      }

      const successUrl = `${APP_URL}/dashboard?pro=success`;
      const cancelUrl = `${APP_URL}/pricing?canceled=1`;

      const sessionIdempotency = `cks_${userId}_${planLabel}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
        metadata: enrichedMetadata,
        subscription_data: {
          metadata: enrichedMetadata,
        },
        allow_promotion_codes: true,
      }, {
        idempotencyKey: sessionIdempotency,
      });

      return { type: 'ok' as const, session: checkoutSession };
    });

    if (checkoutSessionOrFailure.type === 'conflict') {
      return NextResponse.json(
        { ok: false, error: 'Abbonamento PRO già attivo' },
        { status: 409 }
      );
    }

    if (checkoutSessionOrFailure.type === 'error') {
      return NextResponse.json(
        {
          ok: false,
          error: checkoutSessionOrFailure.error,
          ...(checkoutSessionOrFailure.debugCode ? { debugCode: checkoutSessionOrFailure.debugCode } : {}),
        },
        { status: checkoutSessionOrFailure.status }
      );
    }

    const checkoutSession = checkoutSessionOrFailure.session;

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
      cause?: unknown;
    };

    const isLockFailure = (() => {
      const code =
        (error as { code?: unknown })?.code ??
        (stripeAny.cause as { code?: unknown } | undefined)?.code;
      if (typeof code === 'string') {
        const c = code.toUpperCase();
        if (
          c.includes('LOCK') ||
          c === '55P03' ||
          c.includes('DEADLOCK') ||
          c === '40001'
        ) {
          return true;
        }
      }
      const msg =
        ((error as { message?: string })?.message ?? '') +
        ' ' +
        ((stripeAny.cause as { message?: string } | undefined)?.message ?? '');
      return /lock|deadlock|could not obtain|serializ/i.test(msg);
    })();

    if (isLockFailure) {
      console.warn('[CHECKOUT] 503 tx_lock_unavailable', JSON.stringify({
        stage: 'stripe_tx_lock',
        userIdPrefix: typeof userId === 'string' ? userId.slice(0, 8) + '…' : 'n/a',
        message: (error as { message?: string })?.message,
        code: (error as { code?: unknown })?.code,
      }));
      return NextResponse.json(
        {
          ok: false,
          error:
            'Impossibile avviare il checkout in questo momento. Riprova tra qualche secondo.',
          debugCode: 'CHECKOUT_LOCK_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

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
