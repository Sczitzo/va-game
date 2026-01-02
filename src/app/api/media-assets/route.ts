import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const mediaAssets = await prisma.mediaAsset.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ mediaAssets }, { status: 200 });
  } catch (error) {
    console.error('Media assets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media assets' },
      { status: 500 }
    );
  }
}

