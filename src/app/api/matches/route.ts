import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Role } from "@prisma/client";
import { calculateCareerIndexChange } from "@/lib/career-index";
import {
  calculateXpEarned,
  levelFromXp,
  getStatusFromLevel,
} from "@/lib/xp-levels";
import { careerIndexToOverall } from "@/lib/ovr";
import { getSeasonKeyInfo } from "@/lib/seasons";
import { checkAchievementsAfterMatch } from "@/lib/achievements";

const matchCreateSchema = z
  .object({
    playedAt: z.string().datetime(),
    result: z.string().optional(),
    team1Score: z.number().int().min(0).max(30),
    team2Score: z.number().int().min(0).max(30),
    team: z.enum(['T1', 'T2']),
    role: z.nativeEnum(Role),
    goals: z.number().int().min(0).max(15).optional(),
    assists: z.number().int().min(0).max(10).optional(),
    penaltiesSaved: z.number().int().min(0).max(20).optional(),
    keySaves: z.number().int().min(0).max(30).optional(),
    cleanSheet: z.boolean().optional(),
    notes: z.string().max(250).optional().nullable(),
  })
  .strip();

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

    // Normalize team scores to player-centric goalsFor / goalsAgainst
    const goalsFor = parsed.team === 'T1' ? parsed.team1Score : parsed.team2Score;
    const goalsAgainst = parsed.team === 'T1' ? parsed.team2Score : parsed.team1Score;

    const derivedResult =
      goalsFor > goalsAgainst
        ? "WIN"
        : goalsFor === goalsAgainst
        ? "DRAW"
        : "LOSS";

    const isGoalkeeper = parsed.role === Role.POR;
    const goals = isGoalkeeper ? 0 : Math.max(0, parsed.goals ?? 0);
    const assists = isGoalkeeper ? 0 : Math.max(0, parsed.assists ?? 0);
    const penaltiesSaved = isGoalkeeper ? Math.max(0, parsed.penaltiesSaved ?? 0) : 0;
    const keySaves = isGoalkeeper ? Math.max(0, parsed.keySaves ?? 0) : 0;

    if (!isGoalkeeper && goals > goalsFor) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "I gol segnati dal giocatore non possono superare i gol totali della squadra",
        },
        { status: 400 }
      );
    }

    const playedAtDate = new Date(parsed.playedAt);
    const nowUtc = new Date();

    if (playedAtDate.getTime() > nowUtc.getTime()) {
      return NextResponse.json(
        { ok: false, error: "La data della partita non può essere nel futuro" },
        { status: 400 }
      );
    }

    const seventyTwoHoursAgo = new Date(nowUtc.getTime() - 72 * 60 * 60 * 1000);
    if (playedAtDate.getTime() < seventyTwoHoursAgo.getTime()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Puoi registrare solo partite delle ultime 72 ore. Per partite più vecchie contatta l'assistenza.",
        },
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
        {
          ok: false,
          error:
            "Profilo giocatore non trovato. Completa prima l'onboarding.",
        },
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

    if (matchesSameDay >= 2) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Hai già registrato 2 partite oggi. Puoi registrare massimo 2 partite per giorno.",
        },
        { status: 400 }
      );
    }

    const twoHoursBefore = new Date(playedAtDate.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(playedAtDate.getTime() + 2 * 60 * 60 * 1000);
    const matchNearby = await prisma.match.findFirst({
      where: {
        playerId: player.id,
        playedAt: {
          gt: twoHoursBefore,
          lt: twoHoursAfter,
        },
      },
      orderBy: { playedAt: "asc" },
      select: { playedAt: true },
    });

    if (matchNearby) {
      const diffMs = Math.abs(
        playedAtDate.getTime() - new Date(matchNearby.playedAt).getTime(),
      );
      const diffMinutes = Math.round(diffMs / 60_000);
      const minutesToWait = 120 - diffMinutes;
      return NextResponse.json(
        {
          ok: false,
          error: `Devono passare almeno 2 ore tra due partite registrate. Attendi altri ${Math.max(
            1,
            minutesToWait,
          )} minuti o scegli un orario diverso.`,
        },
        { status: 400 }
      );
    }

    const duplicateCount = await prisma.match.count({
      where: {
        playerId: player.id,
        playedAt: playedAtDate,
        role: parsed.role,
        goalsFor,
        goalsAgainst,
      },
    });

    if (duplicateCount > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Sembra che questa partita sia già stata registrata (stesso orario, ruolo e punteggio). Controlla tra le tue partite.",
        },
        { status: 400 }
      );
    }

    let cleanSheet = parsed.cleanSheet ?? false;
    if (!isGoalkeeper) {
      cleanSheet = false;
    }
    if (cleanSheet && goalsAgainst !== 0) {
      cleanSheet = false;
    }
    // Auto cleanSheet for POR when GA = 0 (user doesn't need to set it, but honor their false if they explicit it)
    if (isGoalkeeper && goalsAgainst === 0 && (parsed.cleanSheet === undefined || parsed.cleanSheet === true)) {
      cleanSheet = true;
    }

    const ciChange = calculateCareerIndexChange({
      result: derivedResult,
      role: parsed.role,
      goals,
      assists,
      cleanSheet,
      goalsAgainst,
      penaltiesSaved,
      keySaves,
    });

    const oldCI = player.careerIndex;
    const newCI = Math.max(400, oldCI + ciChange);

    const xpEarned = calculateXpEarned({
      result: derivedResult,
      role: parsed.role,
      goals,
      assists,
      cleanSheet,
    });

    const oldXp = player.xp;
    const oldLevel = player.level;
    const newTotalXp = player.xp + xpEarned;
    const newLevel = levelFromXp(newTotalXp);
    const leveledUp = newLevel > oldLevel;
    const oldStatus = getStatusFromLevel(oldLevel);
    const newStatus = getStatusFromLevel(newLevel);

    const oldOverall = player.overall;
    const newOverall = careerIndexToOverall(newCI);

    const seasonInfo = getSeasonKeyInfo(playedAtDate);

    const txResult = await prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          playerId: player.id,
          playedAt: playedAtDate,
          result: derivedResult,
          goalsFor,
          goalsAgainst,
          role: parsed.role,
          goals,
          assists,
          penaltiesSaved,
          keySaves,
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
          wins: derivedResult === "WIN" ? { increment: 1 } : undefined,
          draws: derivedResult === "DRAW" ? { increment: 1 } : undefined,
          losses: derivedResult === "LOSS" ? { increment: 1 } : undefined,
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
            wins: derivedResult === "WIN" ? 1 : 0,
            draws: derivedResult === "DRAW" ? 1 : 0,
            losses: derivedResult === "LOSS" ? 1 : 0,
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
            wins: derivedResult === "WIN" ? { increment: 1 } : undefined,
            draws: derivedResult === "DRAW" ? { increment: 1 } : undefined,
            losses: derivedResult === "LOSS" ? { increment: 1 } : undefined,
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
      oldXp,
      newXp: newTotalXp,
      careerIndexChange: ciChange,
      leveledUp,
      oldLevel,
      newLevel,
      oldStatus,
      newStatus,
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
