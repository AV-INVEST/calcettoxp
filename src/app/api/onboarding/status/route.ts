import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.userId) {
    return NextResponse.json({ ok: false, exists: false, error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const existing = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
      select: { id: true, primaryRole: true, secondaryRole: true, nickname: true },
    });

    return NextResponse.json({
      ok: true,
      exists: !!existing,
      playerId: existing?.id ?? null,
      primaryRole: existing?.primaryRole ?? null,
      secondaryRole: existing?.secondaryRole ?? null,
      nickname: existing?.nickname ?? null,
    });
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json({ ok: false, exists: false, error: "Errore interno" }, { status: 500 });
  }
}
