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

const matchCreateSchema = z.object({
  playedAt: z.string().datetime(),
  result: z.nativeEnum(MatchResult),
  goalsFor: z.number().int().min(0).max(30),
  goalsAgainst: z.number().int().min(0).max(30),
  role: z.nativeEnum(Role),
  goals: z.number().int().min(0).max(15),
  assists: z.number().int().min(0).max(10),
  cleanSheet: z.boolean().optional(),
  notes: z.string().max(250).optional().nullable(),
}).strip();

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.userId) {
    return NextResponse.json(
      { ok: false, error: "Non autorizzato" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = matchCreateSchema.parse(body);

    const playedAtDate = new Date(parsed.playedAt);
    const nowUtc = new Date();

    if (playedAtDate.getTime() > nowUtc.getTime()) {
      return NextResponse.json(
        { ok: false, error: "La data della partita non può essere nel futuro" },
        { status: 400 }
      );
    }

    const twentyFourHoursAgo = new Date(nowUtc.getTime() - 24 * 60 * 60 * 1000);
    if (playedAtDate.getTime() < twentyFourHoursAgo.getTime()) {
      return NextResponse.json(
        { ok: false, error: "Puoi registrare solo partite delle ultime 24 ore" },
        { status: 400 }
      );
    }

    const player = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
      include: {
        achievements: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { ok: false, error: "Profilo giocatore non trovato. Completa prima l'onboarding." },
        { status: 400 }
      );
    }

    const startOfDay = new Date(playedAtDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(playedAtDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const matchesSameDay = await prisma.match.count({
      where: {
        playerId: player.id,
        playedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (matchesSameDay >= 3) {
      return NextResponse.json(
        { ok: false, error: "Hai già registrato 3 partite oggi. Riprova domani." },
        { status: 400 }
      );
    }

    let cleanSheet = parsed.cleanSheet ?? false;
    if (parsed.role !== Role.POR) {
      cleanSheet = false;
    }

    const ciChange = calculateCareerIndexChange({
      result: parsed.result,
      role: parsed.role,
      goals: parsed.goals,
      assists: parsed.assists,
      cleanSheet,
    });

    const oldCI = player.careerIndex;
    const newCI = Math.max(400, oldCI + ciChange);

    const xpEarned = calculateXpEarned({
      result: parsed.result,
      role: parsed.role,
      goals: parsed.goals,
      assists: parsed.assists,
      cleanSheet,
    });

    const oldLevel = player.level;
    const newTotalXp = player.xp + xpEarned;
    const newLevel = levelFromXp(newTotalXp);
    const leveledUp = newLevel > oldLevel;

    const oldOverall = player.overall;
    const newOverall = careerIndexToOverall(newCI);

    const seasonInfo = getSeasonKeyInfo(playedAtDate);

    const txResult = await prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          playerId: player.id,
          playedAt: playedAtDate,
          result: parsed.result,
          goalsFor: parsed.goalsFor,
          goalsAgainst: parsed.goalsAgainst,
          role: parsed.role,
          goals: parsed.goals,
          assists: parsed.assists,
          cleanSheet,
          notes: parsed.notes ?? null,
          careerIndexBefore: oldCI,
          careerIndexAfter: newCI,
          careerIndexChange: ciChange,
          xpEarned,
          lockedAt: new Date(Date.now() + 15 * 60 * 1000),
          isVerified: false,
          verificationType: "SELF_REPORTED",
          seasonKey: seasonInfo.seasonKey,
        },
      });

      await tx.careerIndexHistory.create({
        data: {
          playerProfileId: player.id,
          matchId: match.id,
          valueBefore: oldCI,
          valueAfter: newCI,
          changeValue: ciChange,
        },
      });

      const updatedPlayer = await tx.playerProfile.update({
        where: { id: player.id },
        data: {
          careerIndex: newCI,
          overall: newOverall,
          xp: newTotalXp,
          level: newLevel,
          matchesPlayed: { increment: 1 },
          wins: parsed.result === "WIN" ? { increment: 1 } : undefined,
          draws: parsed.result === "DRAW" ? { increment: 1 } : undefined,
          losses: parsed.result === "LOSS" ? { increment: 1 } : undefined,
          goals: { increment: parsed.goals },
          assists: { increment: parsed.assists },
          cleanSheets: cleanSheet ? { increment: 1 } : undefined,
          currentSeasonKey: seasonInfo.seasonKey,
        },
        include: {
          achievements: true,
        },
      });

      const existingSeason = await tx.playerSeason.findUnique({
        where: {
          playerProfileId_seasonKey: {
            playerProfileId: player.id,
            seasonKey: seasonInfo.seasonKey,
          },
        },
      });

      if (!existingSeason) {
        await tx.playerSeason.create({
          data: {
            playerProfileId: player.id,
            seasonKey: seasonInfo.seasonKey,
            name: seasonInfo.name,
            startDate: seasonInfo.startDate,
            endDate: seasonInfo.endDate,
            matches: 1,
            wins: parsed.result === "WIN" ? 1 : 0,
            draws: parsed.result === "DRAW" ? 1 : 0,
            losses: parsed.result === "LOSS" ? 1 : 0,
            goals: parsed.goals,
            assists: parsed.assists,
            startCareerIndex: oldCI,
            endCareerIndex: newCI,
            peakCareerIndex: Math.max(oldCI, newCI),
            startOverall: oldOverall,
            endOverall: newOverall,
          },
        });
      } else {
        await tx.playerSeason.update({
          where: {
            playerProfileId_seasonKey: {
              playerProfileId: player.id,
              seasonKey: seasonInfo.seasonKey,
            },
          },
          data: {
            matches: { increment: 1 },
            wins: parsed.result === "WIN" ? { increment: 1 } : undefined,
            draws: parsed.result === "DRAW" ? { increment: 1 } : undefined,
            losses: parsed.result === "LOSS" ? { increment: 1 } : undefined,
            goals: { increment: parsed.goals },
            assists: { increment: parsed.assists },
            endCareerIndex: newCI,
            endOverall: newOverall,
            peakCareerIndex: Math.max(existingSeason.peakCareerIndex, newCI),
          },
        });
      }

      const achievementsUnlocked = await checkAchievementsAfterMatch(updatedPlayer, match, tx);

      const savedAchievements = [];
      for (const ach of achievementsUnlocked) {
        const achievementInDb = await tx.achievement.findUnique({
          where: { key: ach.key },
        });

        if (achievementInDb) {
          const alreadyOwned = await tx.playerAchievement.findUnique({
            where: {
              playerProfileId_achievementId: {
                playerProfileId: player.id,
                achievementId: achievementInDb.id,
              },
            },
          });

          const saved = await tx.playerAchievement.upsert({
            where: {
              playerProfileId_achievementId: {
                playerProfileId: player.id,
                achievementId: achievementInDb.id,
              },
            },
            create: {
              playerProfileId: player.id,
              achievementId: achievementInDb.id,
              unlockedAt: new Date(),
              progress: achievementInDb.requirementValue,
              progressTarget: achievementInDb.requirementValue,
            },
            update: {},
            include: { achievement: true },
          });
          savedAchievements.push({
            id: saved.achievementId,
            key: ach.key,
            name: saved.achievement.name,
            description: saved.achievement.description,
            icon: saved.achievement.icon,
            tier: saved.achievement.tier,
            unlockedAt: saved.unlockedAt,
          });
        } else {
          savedAchievements.push({
            id: ach.achievementId,
            key: ach.key,
            name: ach.name,
            description: "",
            icon: null,
            tier: "FREE",
            unlockedAt: new Date(),
          });
        }
      }

      return {
        match,
        updatedPlayer,
        savedAchievements,
      };
    });

    return NextResponse.json({
      ok: true,
      match: txResult.match,
      xpEarned,
      careerIndexChange: ciChange,
      leveledUp,
      oldLevel,
      newLevel,
      oldOverall,
      newOverall,
      oldCI,
      newCI,
      unlockedAchievements: txResult.savedAchievements,
      seasonKey: seasonInfo.seasonKey,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      const fieldName = firstIssue?.path?.[0] ?? "dati";
      let msg = "Dati non validi";
      if (firstIssue?.code === "too_small") msg = `${fieldName} troppo basso`;
      if (firstIssue?.code === "too_big") msg = `${fieldName} troppo alto`;
      if (firstIssue?.code === "invalid_string") msg = `${fieldName} non valido`;
      if (firstIssue?.code === "invalid_type") msg = `${fieldName} tipo non valido`;
      return NextResponse.json(
        { ok: false, error: msg, issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Match create error:", error);
    return NextResponse.json(
      { ok: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
