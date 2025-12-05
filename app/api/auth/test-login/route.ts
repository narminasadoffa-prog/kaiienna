import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    console.log('[Test Login API] Testing:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', found: false },
        { status: 404 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'User has no password', found: true, hasPassword: false },
        { status: 400 }
      )
    }

    // Check password
    const isCorrect = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      found: true,
      hasPassword: true,
      passwordCorrect: isCorrect,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('[Test Login API] Error:', error)
    return NextResponse.json(
      {
        error: error.message,
        message: 'Test failed',
      },
      { status: 500 }
    )
  }
}


