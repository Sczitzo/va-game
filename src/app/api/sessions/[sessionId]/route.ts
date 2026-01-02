import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.sessionId },
      include: {
        promptPack: true,
        careTeam: true,
        introMedia: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

