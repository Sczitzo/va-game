import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const responses = await prisma.response.findMany({
      where: {
        sessionId: params.sessionId,
        isHidden: false,
      },
      include: {
        participant: {
          select: {
            id: true,
            nickname: true,
            pseudonymId: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ responses }, { status: 200 });
  } catch (error) {
    console.error('Responses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

