import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Role, MatchResult } from "@prisma/client";
import { calculateCareerIndexChange } from "@/lib/career-index";
import { calculateXpEarned, levelFromXp } from "@/lib/xp-levels";
import { careerIndexToOverall } from "@/lib/ovr";
import { getSeasonKeyInfo } from "@/lib/seasons";
import { checkAchievementsAfterMatch } from "@/lib/achievements";

const matchPatchSchema = z.object({
  result: z.nativeEnum(MatchResult).optional(),
  goalsFor: z.number().int().min(0).max(30).optional(),
  goalsAgainst: z.number().int().min(0).max(30).optional(),
  role: z.nativeEnum(Role).optional(),
  goals: z.number().int().min(0).max(15).optional(),
  assists: z.number().int().min(0).max(10).optional(),
  penaltiesSaved: z.number().int().min(0).max(20).optional(),
  keySaves: z.number().int().min(0).max(30).optional(),
  cleanSheet: z.boolean().optional(),
  notes: z.string().max(250).optional().nullable(),
}).strip();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.userId) {
    return NextResponse.json(
      { ok: false, error: "Non autorizzato" },
      { status: 401 }
    );
  }

  try {
    const player = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
      select: { id: true },
    });

    if (!player) {
      return NextResponse.json(
        { ok: false, error: "Profilo giocatore non trovato" },
        { status: 404 }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return NextResponse.json(
        { ok: false, error: "Partita non trovata" },
        { status: 404 }
      );
    }

    if (match.playerId !== player.id) {
      return NextResponse.json(
        { ok: false, error: "Non autorizzato a visualizzare questa partita" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      match,
    });
  } catch (error) {
    console.error("Match get error:", error);
    return NextResponse.json(
      { ok: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  return NextResponse.json(
    { ok: false, error: "Partite non modificabili" },
    { status: 403 }
  );
}
