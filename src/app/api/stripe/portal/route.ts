import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.userId) {
    return NextResponse.json(
      { ok: false, error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const userId = session.user.userId;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { ok: false, error: 'Nessun abbonamento trovato' },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin');
    if (!origin) {
      return NextResponse.json(
        { ok: false, error: 'Origin header mancante' },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/profile`,
    });

    if (!portalSession.url) {
      return NextResponse.json(
        { ok: false, error: 'Impossibile creare sessione del portale' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: portalSession.url,
    });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { ok: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
