import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { packId: string } }
) {
  try {
    const prompts = await prisma.prompt.findMany({
      where: {
        promptPackId: params.packId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({ prompts }, { status: 200 });
  } catch (error) {
    console.error('Prompts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

