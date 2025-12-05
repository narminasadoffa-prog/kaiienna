import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all pages or single page by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const page = await prisma.staticPage.findUnique({
        where: { slug },
      });

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      return NextResponse.json(page);
    }

    // Get all pages
    const pages = await prisma.staticPage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pages);
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new page (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, content, active } = body;

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: 'slug, title, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.staticPage.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Page with this slug already exists' },
        { status: 400 }
      );
    }

    const page = await prisma.staticPage.create({
      data: {
        slug: slug.trim(),
        title: title.trim(),
        content: content.trim(),
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    console.error('Error creating page:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Page with this slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create page', details: error.message },
      { status: 500 }
    );
  }
}

