import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all banners (or active only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where = activeOnly ? { active: true } : {};

    const banners = await prisma.homepageBanner.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(banners);
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new banner (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Not admin' }, { status: 401 });
    }

    const body = await request.json();
    const { position, videoUrl, link, title, description, active, order } = body;

    if (!position || !videoUrl) {
      return NextResponse.json(
        { error: 'position and videoUrl are required' },
        { status: 400 }
      );
    }

    const trimmedPosition = String(position).trim();
    const trimmedVideoUrl = String(videoUrl).trim();

    if (!trimmedPosition || !trimmedVideoUrl) {
      return NextResponse.json(
        { error: 'position and videoUrl cannot be empty' },
        { status: 400 }
      );
    }

    // Check if position already exists
    const existing = await prisma.homepageBanner.findUnique({
      where: { position: trimmedPosition },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Banner with this position already exists' },
        { status: 400 }
      );
    }

    // Create banner
    const banner = await prisma.homepageBanner.create({
      data: {
        position: trimmedPosition,
        videoUrl: trimmedVideoUrl,
        link: link ? String(link).trim() : null,
        title: title ? String(title).trim() : null,
        description: description ? String(description).trim() : null,
        active: active !== undefined ? Boolean(active) : true,
        order: order !== undefined ? Number(order) || 0 : 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error('[Banners API] Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner', details: error.message },
      { status: 500 }
    );
  }
}

