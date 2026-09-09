import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { z } from 'zod';

const planSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.userId) {
    return NextResponse.json(
      { ok: false, error: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = planSchema.parse(body);

    const priceId =
      parsed.plan === 'monthly'
        ? process.env.STRIPE_PRICE_PRO_MONTHLY
        : process.env.STRIPE_PRICE_PRO_YEARLY;

    if (!priceId) {
      return NextResponse.json(
        { ok: false, error: 'Prezzo non valido o configurazione mancante' },
        { status: 400 }
      );
    }

    const userId = session.user.userId;

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
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Utente non trovato' },
        { status: 400 }
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

    const origin = req.headers.get('origin');
    if (!origin) {
      return NextResponse.json(
        { ok: false, error: 'Origin header mancante' },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?pro=success`,
      cancel_url: `${origin}/pricing?canceled=1`,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
      payment_method_types: ['card'],
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
      return NextResponse.json(
        { ok: false, error: 'Piano non valido', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { ok: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
