import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NON_TERMINAL_STRIPE_STATUSES: ReadonlyArray<string> = [
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'incomplete',
  'paused',
] as const;

const TERMINAL_STRIPE_STATUSES: ReadonlyArray<string> = [
  'canceled',
  'incomplete_expired',
] as const;

export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.userId || session?.user?.id;

  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Non autorizzato.' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscription: {
          select: {
            stripeSubscriptionId: true,
            stripeCustomerId: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Utente non trovato.' }, { status: 404 });
    }

    const sub = user.subscription;
    const stripeSubscriptionId = sub?.stripeSubscriptionId ?? null;
    const stripeCustomerId = sub?.stripeCustomerId ?? null;

    if (stripeSubscriptionId) {
      let remoteSub;
      try {
        remoteSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      } catch (retrieveErr) {
        const err = retrieveErr as { message?: string; code?: string };
        const isNotFound =
          (err.code && typeof err.code === 'string' && err.code.toUpperCase() === 'RESOURCE_MISSING') ||
          (err.message && /no such subscription/i.test(err.message));

        if (!isNotFound) {
          console.error('[account-delete] stripe retrieve failed (cannot verify):', JSON.stringify({
            userIdPrefix: userId.slice(0, 8) + '…',
            message: err.message,
            code: err.code,
          }));
          return NextResponse.json(
            {
              ok: false,
              message: 'Impossibile verificare lo stato dell\'abbonamento. Riprova tra poco.',
            },
            { status: 503 }
          );
        }

        console.warn('[account-delete] stripe sub not found remotely (already deleted):', JSON.stringify({
          userIdPrefix: userId.slice(0, 8) + '…',
          subIdPrefix: stripeSubscriptionId.slice(0, 14) + '…',
        }));
        remoteSub = null;
      }

      if (remoteSub) {
        const isTerminal = TERMINAL_STRIPE_STATUSES.includes(remoteSub.status);
        const needsCancellation = NON_TERMINAL_STRIPE_STATUSES.includes(remoteSub.status);

        if (needsCancellation) {
          try {
            const canceled = await stripe.subscriptions.cancel(stripeSubscriptionId, {
              cancellation_details: {
                comment: 'Account CalcettoXP eliminato dall\'utente.',
              },
            });
            if (!canceled || !TERMINAL_STRIPE_STATUSES.includes(canceled.status)) {
              console.error('[account-delete] stripe cancel did not return terminal status:', JSON.stringify({
                userIdPrefix: userId.slice(0, 8) + '…',
                returnedStatus: canceled?.status ?? 'unknown',
              }));
              return NextResponse.json(
                {
                  ok: false,
                  message: 'Impossibile annullare l\'abbonamento in questo momento. Riprova tra poco.',
                },
                { status: 503 }
              );
            }
            console.info('[account-delete] stripe sub canceled:', JSON.stringify({
              userIdPrefix: userId.slice(0, 8) + '…',
              subIdPrefix: stripeSubscriptionId.slice(0, 14) + '…',
            }));
          } catch (cancelErr) {
            const cerr = cancelErr as { message?: string; code?: string };
            console.error('[account-delete] stripe cancel failed (aborting DB delete):', JSON.stringify({
              userIdPrefix: userId.slice(0, 8) + '…',
              message: cerr.message,
              code: cerr.code,
            }));
            return NextResponse.json(
              {
                ok: false,
                message: 'Impossibile annullare l\'abbonamento. Riprova tra poco.',
              },
              { status: 503 }
            );
          }
        } else if (!isTerminal) {
          console.error('[account-delete] unexpected stripe status (cannot proceed safely):', JSON.stringify({
            userIdPrefix: userId.slice(0, 8) + '…',
            status: remoteSub.status,
          }));
          return NextResponse.json(
            {
              ok: false,
              message: 'Stato abbonamento non chiaro. Riprova tra poco o contatta l\'assistenza.',
            },
            { status: 500 }
          );
        }
      }
    } else if (stripeCustomerId) {
      try {
        const remoteSubs = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 20,
        });
        for (const s of remoteSubs.data) {
          if (NON_TERMINAL_STRIPE_STATUSES.includes(s.status)) {
            try {
              const canceled = await stripe.subscriptions.cancel(s.id, {
                cancellation_details: {
                  comment: 'Account CalcettoXP eliminato dall\'utente (customer-level cleanup).',
                },
              });
              if (!canceled || !TERMINAL_STRIPE_STATUSES.includes(canceled.status)) {
                console.error('[account-delete] stripe customer-level cancel non-terminal:', JSON.stringify({
                  userIdPrefix: userId.slice(0, 8) + '…',
                  subIdPrefix: s.id.slice(0, 14) + '…',
                  returnedStatus: canceled?.status ?? 'unknown',
                }));
                return NextResponse.json(
                  {
                    ok: false,
                    message: 'Impossibile annullare un abbonamento attivo. Riprova tra poco.',
                  },
                  { status: 503 }
                );
              }
              console.info('[account-delete] stripe customer-level sub canceled:', JSON.stringify({
                userIdPrefix: userId.slice(0, 8) + '…',
                subIdPrefix: s.id.slice(0, 14) + '…',
              }));
            } catch (ccErr) {
              const cerr = ccErr as { message?: string; code?: string };
              console.error('[account-delete] stripe customer-level cancel failed:', JSON.stringify({
                userIdPrefix: userId.slice(0, 8) + '…',
                subIdPrefix: s.id.slice(0, 14) + '…',
                message: cerr.message,
                code: cerr.code,
              }));
              return NextResponse.json(
                {
                  ok: false,
                  message: 'Impossibile verificare/annullare abbonamenti esistenti. Riprova tra poco.',
                },
                { status: 503 }
              );
            }
          }
        }
      } catch (listErr) {
        const lerr = listErr as { message?: string; code?: string };
        console.error('[account-delete] stripe customer subs list failed:', JSON.stringify({
          userIdPrefix: userId.slice(0, 8) + '…',
          message: lerr.message,
          code: lerr.code,
        }));
        return NextResponse.json(
          {
            ok: false,
            message: 'Impossibile verificare gli abbonamenti attivi. Riprova tra poco.',
          },
          { status: 503 }
        );
      }
    }

    if (stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      try {
        await stripe.customers.update(stripeCustomerId, {
          metadata: { calcettoxp_account_deleted: 'true' },
        });
      } catch (e) {
        const cuErr = e as { message?: string };
        console.warn('[account-delete] stripe customer metadata update failed (non-fatal):', JSON.stringify({
          userIdPrefix: userId.slice(0, 8) + '…',
          message: cuErr.message,
        }));
      }
    }

    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({
      ok: true,
      message: 'Account eliminato con successo. Grazie per aver giocato con CalcettoXP.',
    });
  } catch (err) {
    console.error('[account-delete] fatal error:', err);
    return NextResponse.json(
      { ok: false, message: 'Non siamo riusciti a eliminare l\'account. Riprova tra poco.' },
      { status: 500 }
    );
  }
}
