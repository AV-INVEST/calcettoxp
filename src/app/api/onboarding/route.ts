import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { careerIndexToOverall } from "@/lib/ovr";
import { getSeasonKeyInfo } from "@/lib/seasons";
import { Role, PreferredFoot } from "@prisma/client";
import { USERNAME_REGEX, validateUsernameFormat } from "@/lib/username-config";

const onboardingSchema = z.object({
  nickname: z.string().min(2).max(20).optional(),
  username: z.string().regex(USERNAME_REGEX, "Username non valido"),
  birthDate: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  preferredFoot: z.nativeEnum(PreferredFoot),
  primaryRole: z.nativeEnum(Role),
  secondaryRole: z.nativeEnum(Role).optional().nullable(),
}).strip();

export async function POST(req: Request) {
  const session = await auth();
  const userId: string | undefined =
    session?.user?.userId ?? session?.user?.id;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const existing = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Profilo già esistente", playerId: existing.id },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = onboardingSchema.parse(body);

    parsed.username = parsed.username.toLowerCase().trim();

    const formatCheck = validateUsernameFormat(parsed.username);
    if (!formatCheck.valid) {
      const reason = formatCheck.reason || "invalid";
      let message = "L'username deve essere tra 3 e 20 caratteri minuscoli, numeri o underscore.";
      if (reason === "reserved") message = "Questo username non è disponibile.";
      if (reason === "offensive") message = "Questo username non rispetta le linee guida della community.";
      return NextResponse.json(
        { ok: false, error: message },
        { status: 400 }
      );
    }

    const finalNickname: string = (parsed.nickname && parsed.nickname.trim())
      ? parsed.nickname.trim()
      : parsed.username;

    const usernameTaken = await prisma.playerProfile.findUnique({
      where: { username: parsed.username },
      select: { id: true },
    });
    if (usernameTaken) {
      return NextResponse.json(
        { ok: false, error: "Questo username è già utilizzato" },
        { status: 400 }
      );
    }

    const initialCareerIndex = 1000;
    const initialOverall = careerIndexToOverall(initialCareerIndex);
    const season = getSeasonKeyInfo();

    const result = await prisma.$transaction(async (tx) => {
      const playerProfile = await tx.playerProfile.create({
        data: {
          userId,
          username: parsed.username,
          nickname: finalNickname,
          birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
          country: parsed.country ?? null,
          city: parsed.city ?? null,
          preferredFoot: parsed.preferredFoot,
          primaryRole: parsed.primaryRole,
          secondaryRole: parsed.secondaryRole ?? null,
          isPublic: true,
          showCity: false,
          cardTheme: "CLASSIC",
          level: 1,
          xp: 0,
          careerIndex: initialCareerIndex,
          overall: initialOverall,
          currentSeasonKey: season.seasonKey,
        },
      });

      await tx.careerIndexHistory.create({
        data: {
          playerProfileId: playerProfile.id,
          matchId: null,
          valueBefore: initialCareerIndex,
          valueAfter: initialCareerIndex,
          changeValue: 0,
        },
      });

      await tx.playerSeason.create({
        data: {
          playerProfileId: playerProfile.id,
          seasonKey: season.seasonKey,
          name: season.name,
          startDate: season.startDate,
          endDate: season.endDate,
          startCareerIndex: initialCareerIndex,
          endCareerIndex: initialCareerIndex,
          peakCareerIndex: initialCareerIndex,
          startOverall: initialOverall,
          endOverall: initialOverall,
        },
      });

      return playerProfile;
    });

    return NextResponse.json({ ok: true, playerId: result.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Dati non validi", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { ok: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
