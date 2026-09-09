import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { SubscriptionStatus } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    if (
      sub?.stripeSubscriptionId &&
      (sub.subscriptionStatus === SubscriptionStatus.ACTIVE ||
        sub.subscriptionStatus === SubscriptionStatus.TRIALING)
    ) {
      try {
        await stripe.subscriptions.cancel(sub.stripeSubscriptionId, {
          cancellation_details: {
            comment: 'Account CalcettoXP eliminato dall\'utente.',
          },
        });
      } catch (stripeErr) {
        console.error('[account-delete] stripe cancel failed:', stripeErr);
      }
    }

    if (sub?.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
      try {
        await stripe.customers.update(sub.stripeCustomerId, {
          metadata: { calcettoxp_account_deleted: 'true' },
        });
      } catch (e) {
        console.error('[account-delete] stripe customer update failed:', e);
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
