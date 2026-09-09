import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Role, PreferredFoot } from "@prisma/client";
import { addDays, differenceInDays } from "date-fns";
import {
  validateUsernameFormat,
  canChangeUsername,
  CARD_THEMES,
} from "@/lib/username-config";

const patchSchema = z
  .object({
    nickname: z.string().min(2).max(20).optional(),
    country: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    preferredFoot: z.nativeEnum(PreferredFoot).optional().nullable(),
    primaryRole: z.nativeEnum(Role).optional(),
    secondaryRole: z.nativeEnum(Role).optional().nullable(),
    birthDate: z.string().optional().nullable(),
    username: z.string().min(3).max(20).optional(),
    isPublic: z.boolean().optional(),
    showCity: z.boolean().optional(),
    cardTheme: z.enum(CARD_THEMES).optional(),
  })
  .strip();

export async function GET() {
  const session = await auth();

  if (!session?.user?.userId) {
    return NextResponse.json({ ok: false, error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
      include: {
        seasons: {
          orderBy: { startDate: "desc" },
        },
      },
    });

    if (!playerProfile) {
      return NextResponse.json(
        { ok: false, error: "Profilo giocatore non trovato" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.userId },
    });

    return NextResponse.json({
      ok: true,
      player: playerProfile,
      subscription,
      user,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.userId) {
    return NextResponse.json({ ok: false, error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = patchSchema.parse(body);

    const currentProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
      select: {
        id: true,
        username: true,
        birthDate: true,
        primaryRole: true,
        lastPrimaryRoleChangeAt: true,
        lastUsernameChangeAt: true,
      },
    });

    if (!currentProfile) {
      return NextResponse.json(
        { ok: false, error: "Profilo giocatore non trovato" },
        { status: 404 }
      );
    }

    if (parsed.birthDate !== undefined) {
      return NextResponse.json(
        {
          ok: false,
          error: "Data di nascita non modificabile nella MVP",
        },
        { status: 400 }
      );
    }

    const data: Record<string, any> = {};

    if (parsed.username !== undefined && parsed.username !== currentProfile.username) {
      const desired = parsed.username.trim().toLowerCase();

      const formatCheck = validateUsernameFormat(desired);
      if (!formatCheck.valid) {
        return NextResponse.json(
          {
            ok: false,
            error:
              formatCheck.reason === 'reserved'
                ? 'Questo username non è disponibile.'
                : 'Username non valido: usa 3-20 caratteri minuscoli, lettere, numeri o underscore.',
          },
          { status: 400 }
        );
      }

      const changeCheck = canChangeUsername(currentProfile.lastUsernameChangeAt);
      if (!changeCheck.allowed) {
        const nextChangeDate = changeCheck.nextChangeDate!;
        const daysLeft = Math.max(
          1,
          differenceInDays(addDays(currentProfile.lastUsernameChangeAt!, 30), new Date())
        );
        return NextResponse.json(
          {
            ok: false,
            error: `Puoi cambiare username tra ${daysLeft} giorni`,
            nextChangeDate: nextChangeDate.toISOString(),
          },
          { status: 400 }
        );
      }

      const existing = await prisma.playerProfile.findUnique({
        where: { username: desired },
        select: { id: true },
      });
      if (existing && existing.id !== currentProfile.id) {
        return NextResponse.json(
          { ok: false, error: 'Questo username è già utilizzato.' },
          { status: 409 }
        );
      }

      data.username = desired;
      data.lastUsernameChangeAt = new Date();
    }

    if (parsed.isPublic !== undefined) data.isPublic = parsed.isPublic;
    if (parsed.showCity !== undefined) data.showCity = parsed.showCity;
    if (parsed.cardTheme !== undefined) data.cardTheme = parsed.cardTheme;

    if (parsed.primaryRole !== undefined && parsed.primaryRole !== currentProfile.primaryRole) {
      const now = new Date();
      if (currentProfile.lastPrimaryRoleChangeAt) {
        const daysSinceChange = differenceInDays(now, currentProfile.lastPrimaryRoleChangeAt);
        if (daysSinceChange < 30) {
          const nextChangeDate = addDays(currentProfile.lastPrimaryRoleChangeAt, 30);
          const daysLeft = 30 - daysSinceChange;
          return NextResponse.json(
            {
              ok: false,
              error: `Puoi cambiare ruolo tra ${daysLeft} giorni`,
              nextChangeDate: nextChangeDate.toISOString(),
            },
            { status: 400 }
          );
        }
      }
      data.primaryRole = parsed.primaryRole;
      data.lastPrimaryRoleChangeAt = now;
    }

    if (parsed.nickname !== undefined) data.nickname = parsed.nickname;
    if (parsed.country !== undefined) data.country = parsed.country;
    if (parsed.city !== undefined) data.city = parsed.city;
    if (parsed.preferredFoot !== undefined) data.preferredFoot = parsed.preferredFoot;
    if (parsed.secondaryRole !== undefined) data.secondaryRole = parsed.secondaryRole;

    const updatedPlayer = await prisma.playerProfile.update({
      where: { id: currentProfile.id },
      data,
      include: {
        seasons: {
          orderBy: { startDate: "desc" },
        },
      },
    });

    return NextResponse.json({ ok: true, player: updatedPlayer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Dati non validi", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { ok: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
