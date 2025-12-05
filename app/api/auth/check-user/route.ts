import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        OR: [
          { deletedAt: null },
          { deletedAt: undefined },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: false, // Don't return password
      },
    })

    if (!user) {
      return NextResponse.json(
        { 
          found: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      found: true,
      user,
    })
  } catch (error: any) {
    console.error('[Check User] Error:', error)
    return NextResponse.json(
      {
        error: error.message,
        message: 'Database error',
      },
      { status: 500 }
    )
  }
}


