import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateUsernameFormat } from '@/lib/username-config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = (searchParams.get('username') || '').trim();

    if (!username) {
      return NextResponse.json(
        { available: false, reason: 'invalid', message: 'Username mancante.' },
        { status: 400 }
      );
    }

    const formatCheck = validateUsernameFormat(username);
    if (!formatCheck.valid) {
      return NextResponse.json({
        available: false,
        reason: formatCheck.reason || 'invalid',
        message:
          formatCheck.reason === 'reserved'
            ? 'Questo username non è disponibile.'
            : 'Username non valido: usa 3-20 caratteri minuscoli, lettere, numeri o underscore.',
      });
    }

    const existing = await prisma.playerProfile.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        reason: 'taken',
        message: 'Questo username è già utilizzato.',
      });
    }

    return NextResponse.json({
      available: true,
    });
  } catch (err) {
    console.error('[username-check] error:', err);
    return NextResponse.json(
      { available: false, message: 'Errore durante il controllo dello username.' },
      { status: 500 }
    );
  }
}
