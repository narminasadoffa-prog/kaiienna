import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.staticPage.findUnique({
      where: { id: params.id },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update page (Admin only)
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
    const { slug, title, content, active } = body;

    // Check if page exists
    const existing = await prisma.staticPage.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // If slug is being changed, check if new slug is unique
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.staticPage.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const page = await prisma.staticPage.update({
      where: { id: params.id },
      data: {
        ...(slug && { slug: slug.trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    return NextResponse.json(page);
  } catch (error: any) {
    console.error('Error updating page:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Page with this slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update page', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete page (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = await prisma.staticPage.findUnique({
      where: { id: params.id },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await prisma.staticPage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page', details: error.message },
      { status: 500 }
    );
  }
}

