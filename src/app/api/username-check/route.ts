import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateUsernameFormat } from '@/lib/username-config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usernameRaw = (searchParams.get('u') || searchParams.get('username') || '').trim();

    if (!usernameRaw) {
      return NextResponse.json(
        { ok: false, available: false, reason: 'invalid', message: 'Username mancante.' },
        { status: 400 }
      );
    }

    const username = usernameRaw.toLowerCase();

    const formatCheck = validateUsernameFormat(username);
    if (!formatCheck.valid) {
      const reason = formatCheck.reason || 'invalid';
      let message = 'Username non valido: usa 3-20 caratteri minuscoli, lettere, numeri o underscore.';
      if (reason === 'reserved') message = 'Questo username non è disponibile.';
      if (reason === 'offensive') message = 'Questo username non è consentito per le linee guida della community.';
      return NextResponse.json({
        ok: false,
        available: false,
        reason,
        message,
      });
    }

    const existing = await prisma.playerProfile.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        ok: false,
        available: false,
        reason: 'taken',
        message: 'Questo username è già utilizzato.',
      });
    }

    return NextResponse.json({
      ok: true,
      available: true,
    });
  } catch (err) {
    console.error('[username-check] error:', err);
    return NextResponse.json(
      { ok: false, available: false, message: 'Errore durante il controllo dello username.' },
      { status: 500 }
    );
  }
}
