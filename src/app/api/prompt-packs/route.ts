import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const promptPacks = await prisma.promptPack.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ promptPacks }, { status: 200 });
  } catch (error) {
    console.error('Prompt packs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt packs' },
      { status: 500 }
    );
  }
}

