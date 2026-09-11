import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ShareSource } from "@prisma/client";
import { reconcileAchievementsForProfile } from "@/lib/achievement-engine";

export const dynamic = "force-dynamic";

function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let body: { source?: ShareSource | string } = {};
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
    const sourceRaw = (body?.source ?? "COPY") as ShareSource | string;
    const source: ShareSource =
      sourceRaw === "WEBSHARE" || sourceRaw === "COPY" ? sourceRaw : "COPY";

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "No profile" }, { status: 404 });
    }
    const dayKey = toDayKey(new Date());

    const existing = await prisma.shareRecord.findUnique({
      where: { playerProfileId_dayKey: { playerProfileId: profile.id, dayKey } },
      select: { id: true, shareCount: true },
    });

    let isNewDay = false;
    if (existing) {
      await prisma.shareRecord.update({
        where: { id: existing.id },
        data: { shareCount: { increment: 1 }, source },
      });
    } else {
      isNewDay = true;
      await prisma.shareRecord.create({
        data: {
          playerProfileId: profile.id,
          dayKey,
          source,
          shareCount: 1,
        },
      });
    }

    if (isNewDay) {
      void reconcileAchievementsForProfile(profile.id);
    }

    return NextResponse.json({ ok: true, isNewDay, source, dayKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
