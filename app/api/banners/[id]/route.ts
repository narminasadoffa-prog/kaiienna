import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get single banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await prisma.homepageBanner.findUnique({
      where: { id: params.id },
    });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update banner (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { position, videoUrl, link, title, description, active, order } = body;

    // Check if banner exists
    const existing = await prisma.homepageBanner.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    // If position is being changed, check if new position is unique
    if (position && position !== existing.position) {
      const positionExists = await prisma.homepageBanner.findUnique({
        where: { position },
      });

      if (positionExists) {
        return NextResponse.json(
          { error: 'Banner with this position already exists' },
          { status: 400 }
        );
      }
    }

    const banner = await prisma.homepageBanner.update({
      where: { id: params.id },
      data: {
        ...(position && { position }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(link !== undefined && { link: link || null }),
        ...(title !== undefined && { title: title || null }),
        ...(description !== undefined && { description: description || null }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete banner (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banner = await prisma.homepageBanner.findUnique({
      where: { id: params.id },
    });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    await prisma.homepageBanner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner', details: error.message },
      { status: 500 }
    );
  }
}

