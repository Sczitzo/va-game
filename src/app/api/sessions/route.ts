import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/room-code';

const SESSION_RETENTION_HOURS = parseInt(process.env.SESSION_RETENTION_HOURS || '72', 10);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { careTeamId, moduleId, promptPackId, numRounds, sharingDefaults, introMediaId, facilitatorId } = body;

    // Detailed validation
    const missingFields = [];
    if (!careTeamId) missingFields.push('Care Team');
    if (!moduleId) missingFields.push('Module');
    if (!promptPackId) missingFields.push('Prompt Pack');
    if (!introMediaId) missingFields.push('Intro Media');
    if (!facilitatorId) missingFields.push('Facilitator ID (please log in again)');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const roomCode = generateRoomCode();
    const purgeAfter = new Date();
    purgeAfter.setHours(purgeAfter.getHours() + SESSION_RETENTION_HOURS);

    const session = await prisma.session.create({
      data: {
        careTeamId,
        facilitatorId,
        moduleId,
        promptPackId,
        roomCode,
        numRounds: numRounds || 3,
        sharingDefaults: sharingDefaults || {},
        introMediaId,
        purgeAfter,
      },
      include: {
        introMedia: true,
        promptPack: true,
        careTeam: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: facilitatorId,
        sessionId: session.id,
        action: 'CREATE_SESSION',
        resourceType: 'Session',
        resourceId: session.id,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const facilitatorId = searchParams.get('facilitatorId');

    if (!facilitatorId) {
      return NextResponse.json(
        { error: 'facilitatorId is required' },
        { status: 400 }
      );
    }

    const sessions = await prisma.session.findMany({
      where: {
        facilitatorId,
      },
      include: {
        promptPack: true,
        careTeam: true,
        _count: {
          select: {
            participants: true,
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

