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

export async function PATCH(
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
    const body = await req.json();
    const parsed = matchPatchSchema.parse(body);

    const player = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
    });

    if (!player) {
      return NextResponse.json(
        { ok: false, error: "Profilo giocatore non trovato" },
        { status: 404 }
      );
    }

    const existingMatch = await prisma.match.findUnique({
      where: { id },
    });

    if (!existingMatch) {
      return NextResponse.json(
        { ok: false, error: "Partita non trovata" },
        { status: 404 }
      );
    }

    if (existingMatch.playerId !== player.id) {
      return NextResponse.json(
        { ok: false, error: "Non autorizzato a modificare questa partita" },
        { status: 403 }
      );
    }

    if (existingMatch.lockedAt && new Date() >= new Date(existingMatch.lockedAt)) {
      return NextResponse.json(
        { ok: false, error: "Partita bloccata dopo 15 minuti dalla registrazione" },
        { status: 403 }
      );
    }

    const oldCIChange = existingMatch.careerIndexChange;
    const oldXp = existingMatch.xpEarned;
    const oldResult = existingMatch.result;
    const oldGoals = existingMatch.goals;
    const oldAssists = existingMatch.assists;
    const oldCleanSheet = existingMatch.cleanSheet;
    const oldPenaltiesSaved = (existingMatch as unknown as { penaltiesSaved?: number }).penaltiesSaved ?? 0;
    const oldKeySaves = (existingMatch as unknown as { keySaves?: number }).keySaves ?? 0;

    const laterMatchExists = await prisma.match.count({
      where: {
        playerId: player.id,
        playedAt: { gt: existingMatch.playedAt },
      },
      take: 1,
    });
    if (laterMatchExists > 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Non puoi modificare una partita con partite successive già registrate (mantiene la catena Career Index coerente).',
        },
        { status: 400 }
      );
    }

    const isGoalkeeper = (parsed.role ?? existingMatch.role) === Role.POR;

    const mergedRaw = {
      result: parsed.result ?? existingMatch.result,
      goalsFor: parsed.goalsFor ?? existingMatch.goalsFor,
      goalsAgainst: parsed.goalsAgainst ?? existingMatch.goalsAgainst,
      role: parsed.role ?? existingMatch.role,
      goals: parsed.goals ?? existingMatch.goals,
      assists: parsed.assists ?? existingMatch.assists,
      penaltiesSaved: parsed.penaltiesSaved ?? oldPenaltiesSaved,
      keySaves: parsed.keySaves ?? oldKeySaves,
      cleanSheet: parsed.cleanSheet ?? existingMatch.cleanSheet,
      notes: parsed.notes !== undefined ? parsed.notes : existingMatch.notes,
    };

    const merged = {
      ...mergedRaw,
      goals: isGoalkeeper ? 0 : Math.max(0, mergedRaw.goals),
      assists: isGoalkeeper ? 0 : Math.max(0, mergedRaw.assists),
      penaltiesSaved: isGoalkeeper ? Math.max(0, mergedRaw.penaltiesSaved) : 0,
      keySaves: isGoalkeeper ? Math.max(0, mergedRaw.keySaves) : 0,
    };

    if (merged.result === 'WIN' && merged.goalsFor <= merged.goalsAgainst) {
      return NextResponse.json(
        { ok: false, error: 'Vittoria richiede goalsFor > goalsAgainst' },
        { status: 400 }
      );
    }
    if (merged.result === 'DRAW' && merged.goalsFor !== merged.goalsAgainst) {
      return NextResponse.json(
        { ok: false, error: 'Pareggio richiede goalsFor === goalsAgainst' },
        { status: 400 }
      );
    }
    if (merged.result === 'LOSS' && merged.goalsFor >= merged.goalsAgainst) {
      return NextResponse.json(
        { ok: false, error: 'Sconfitta richiede goalsFor < goalsAgainst' },
        { status: 400 }
      );
    }
    if (!isGoalkeeper && merged.goals > merged.goalsFor) {
      return NextResponse.json(
        { ok: false, error: 'Gol giocatore non possono superare goalsFor' },
        { status: 400 }
      );
    }

    let cleanSheet = merged.cleanSheet;
    if (merged.role !== Role.POR) {
      if (cleanSheet) {
        return NextResponse.json(
          { ok: false, error: 'cleanSheet disponibile solo per ruolo POR' },
          { status: 400 }
        );
      }
      cleanSheet = false;
    }
    if (cleanSheet && merged.goalsAgainst !== 0) {
      return NextResponse.json(
        { ok: false, error: 'cleanSheet richiede goalsAgainst === 0' },
        { status: 400 }
      );
    }
    if (isGoalkeeper && merged.goalsAgainst === 0 && (parsed.cleanSheet === undefined || parsed.cleanSheet === true)) {
      cleanSheet = true;
    }

    const newCIChange = calculateCareerIndexChange({
      result: merged.result,
      role: merged.role,
      goals: merged.goals,
      assists: merged.assists,
      cleanSheet,
      goalsAgainst: merged.goalsAgainst,
      penaltiesSaved: merged.penaltiesSaved,
      keySaves: merged.keySaves,
    });

    const newXpEarned = calculateXpEarned({
      result: merged.result,
      role: merged.role,
      goals: merged.goals,
      assists: merged.assists,
      cleanSheet,
    });

    const ciDiff = newCIChange - oldCIChange;
    const xpDiff = newXpEarned - oldXp;

    const oldCI = player.careerIndex;
    const newCI = Math.max(400, oldCI + ciDiff);
    const newOverall = careerIndexToOverall(newCI);

    const newTotalXp = player.xp + xpDiff;
    const oldLevel = player.level;
    const newLevel = levelFromXp(newTotalXp);
    const leveledUp = newLevel > oldLevel;

    const seasonInfo = getSeasonKeyInfo(existingMatch.playedAt);

    const resultIncrement = {
      WIN: 0,
      DRAW: 0,
      LOSS: 0,
    };
    resultIncrement[oldResult] = -1;
    resultIncrement[merged.result] += 1;

    const txResult = await prisma.$transaction(async (tx) => {
      const updatedMatch = await tx.match.update({
        where: { id: existingMatch.id },
        data: {
          result: merged.result,
          goalsFor: merged.goalsFor,
          goalsAgainst: merged.goalsAgainst,
          role: merged.role,
          goals: merged.goals,
          assists: merged.assists,
          penaltiesSaved: merged.penaltiesSaved,
          keySaves: merged.keySaves,
          cleanSheet,
          notes: merged.notes,
          careerIndexBefore: existingMatch.careerIndexBefore,
          careerIndexAfter: existingMatch.careerIndexBefore + newCIChange,
          careerIndexChange: newCIChange,
          xpEarned: newXpEarned,
          seasonKey: seasonInfo.seasonKey,
        },
      });

      await tx.careerIndexHistory.update({
        where: { matchId: existingMatch.id },
        data: {
          valueBefore: existingMatch.careerIndexBefore,
          valueAfter: existingMatch.careerIndexBefore + newCIChange,
          changeValue: newCIChange,
        },
      });

      const updatedPlayer = await tx.playerProfile.update({
        where: { id: player.id },
        data: {
          careerIndex: newCI,
          overall: newOverall,
          xp: newTotalXp,
          level: newLevel,
          wins: resultIncrement.WIN !== 0 ? { increment: resultIncrement.WIN } : undefined,
          draws: resultIncrement.DRAW !== 0 ? { increment: resultIncrement.DRAW } : undefined,
          losses: resultIncrement.LOSS !== 0 ? { increment: resultIncrement.LOSS } : undefined,
          goals: { increment: merged.goals - oldGoals },
          assists: { increment: merged.assists - oldAssists },
          cleanSheets: cleanSheet !== oldCleanSheet ? { increment: cleanSheet ? 1 : -1 } : undefined,
        },
      });

      const season = await tx.playerSeason.findUnique({
        where: {
          playerProfileId_seasonKey: {
            playerProfileId: player.id,
            seasonKey: seasonInfo.seasonKey,
          },
        },
      });

      if (season) {
        await tx.playerSeason.update({
          where: {
            playerProfileId_seasonKey: {
              playerProfileId: player.id,
              seasonKey: seasonInfo.seasonKey,
            },
          },
          data: {
            wins: resultIncrement.WIN !== 0 ? { increment: resultIncrement.WIN } : undefined,
            draws: resultIncrement.DRAW !== 0 ? { increment: resultIncrement.DRAW } : undefined,
            losses: resultIncrement.LOSS !== 0 ? { increment: resultIncrement.LOSS } : undefined,
            goals: { increment: merged.goals - oldGoals },
            assists: { increment: merged.assists - oldAssists },
            endCareerIndex: newCI,
            endOverall: newOverall,
            peakCareerIndex: Math.max(season.peakCareerIndex, newCI),
          },
        });
      }

      const achievementsUnlocked = await checkAchievementsAfterMatch(updatedPlayer, updatedMatch, tx);

      const savedAchievements = [];
      for (const ach of achievementsUnlocked) {
        const achievementInDb = await tx.achievement.findUnique({
          where: { key: ach.key },
        });

        if (achievementInDb) {
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
        match: updatedMatch,
        player: updatedPlayer,
        savedAchievements,
      };
    });

    return NextResponse.json({
      ok: true,
      match: txResult.match,
      xpEarned: newXpEarned,
      careerIndexChange: newCIChange,
      leveledUp,
      oldLevel,
      newLevel,
      oldOverall: player.overall,
      newOverall,
      oldCI: player.careerIndex,
      newCI,
      unlockedAchievements: txResult.savedAchievements,
      seasonKey: seasonInfo.seasonKey,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Dati non validi", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Match patch error:", error);
    return NextResponse.json(
      { ok: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
