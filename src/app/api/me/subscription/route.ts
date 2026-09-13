import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hasActivePro, detectPlanFromPriceId } from "@/lib/entitlements";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await auth();
  if (!session?.user?.userId) {
    return NextResponse.json(
      { ok: false, isPro: false, plan: null, error: "Non autorizzato" },
      { status: 401 }
    );
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.userId },
      select: {
        subscriptionStatus: true,
        currentPeriodEnd: true,
        stripePriceId: true,
        cancelAtPeriodEnd: true,
      },
    });

    const isPro = hasActivePro(subscription ?? null);
    const plan = detectPlanFromPriceId(
      subscription?.stripePriceId ?? null,
      process.env.STRIPE_PRICE_PRO_MONTHLY,
      process.env.STRIPE_PRICE_PRO_YEARLY
    );

    return NextResponse.json({
      ok: true,
      isPro,
      plan,
      cancelAtPeriodEnd: !!subscription?.cancelAtPeriodEnd,
      currentPeriodEnd: subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toISOString()
        : null,
    });
  } catch (error) {
    const err = error as { message?: string };
    console.error("[me-subscription] error:", err?.message ?? error);
    return NextResponse.json(
      { ok: false, isPro: false, plan: null, error: "Errore interno" },
      { status: 500 }
    );
  }
}
