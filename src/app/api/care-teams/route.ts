import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const careTeams = await prisma.careTeam.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ careTeams }, { status: 200 });
  } catch (error) {
    console.error('Care teams fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch care teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const careTeam = await prisma.careTeam.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json({ careTeam }, { status: 201 });
  } catch (error) {
    console.error('Care team creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create care team' },
      { status: 500 }
    );
  }
}

