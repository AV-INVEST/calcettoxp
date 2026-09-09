import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.userId || session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { ok: false, message: 'Non autorizzato.' },
      { status: 401 }
    );
  }

  try {
    const profile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        nickname: true,
        username: true,
        country: true,
        city: true,
        preferredFoot: true,
        primaryRole: true,
        secondaryRole: true,
        level: true,
        xp: true,
        careerIndex: true,
        overall: true,
        matchesPlayed: true,
        wins: true,
        draws: true,
        losses: true,
        goals: true,
        assists: true,
        cleanSheets: true,
        currentSeasonKey: true,
        isPublic: true,
        showCity: true,
        cardTheme: true,
        lastUsernameChangeAt: true,
        lastPrimaryRoleChangeAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { ok: false, message: 'Profilo non trovato.' },
        { status: 404 }
      );
    }

    const [matches, careerIndexHistory, seasons, unlockedAchievements] = await Promise.all([
      prisma.match.findMany({
        where: { player: { userId } },
        orderBy: { playedAt: 'desc' },
        select: {
          playedAt: true,
          result: true,
          goalsFor: true,
          goalsAgainst: true,
          role: true,
          goals: true,
          assists: true,
          cleanSheet: true,
          notes: true,
          careerIndexBefore: true,
          careerIndexAfter: true,
          careerIndexChange: true,
          xpEarned: true,
          seasonKey: true,
          verificationType: true,
          isVerified: true,
        },
      }),
      prisma.careerIndexHistory.findMany({
        where: { playerProfile: { userId } },
        orderBy: { createdAt: 'asc' },
        select: {
          valueBefore: true,
          valueAfter: true,
          changeValue: true,
          createdAt: true,
        },
      }),
      prisma.playerSeason.findMany({
        where: { playerProfile: { userId } },
        orderBy: { startDate: 'desc' },
        select: {
          seasonKey: true,
          name: true,
          startDate: true,
          endDate: true,
          matches: true,
          wins: true,
          draws: true,
          losses: true,
          goals: true,
          assists: true,
          startCareerIndex: true,
          endCareerIndex: true,
          peakCareerIndex: true,
          startOverall: true,
          endOverall: true,
        },
      }),
      prisma.playerAchievement.findMany({
        where: { playerProfile: { userId } },
        orderBy: { unlockedAt: 'desc' },
        select: {
          unlockedAt: true,
          progress: true,
          progressTarget: true,
          achievement: {
            select: {
              key: true,
              name: true,
              description: true,
              icon: true,
              tier: true,
              requirementType: true,
              requirementValue: true,
            },
          },
        },
      }),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'CalcettoXP',
      version: 1,
      profile,
      preferences: {
        isPublic: profile.isPublic,
        showCity: profile.showCity,
        cardTheme: profile.cardTheme,
      },
      matches,
      careerIndexHistory,
      seasons,
      achievements: unlockedAchievements,
    };

    const filename = `calcettoxp-export-${format(new Date(), 'yyyy-MM-dd')}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('[data-export] error:', err);
    return NextResponse.json(
      { ok: false, message: 'Impossibile generare l\'esportazione in questo momento.' },
      { status: 500 }
    );
  }
}
