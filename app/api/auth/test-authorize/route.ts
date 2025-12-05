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

    console.log('[Test Authorize] Testing:', email)

    // Simulate NextAuth authorize function
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        step: 'findUser',
      })
    }

    if (user.deletedAt) {
      return NextResponse.json({
        success: false,
        error: 'User is deleted',
        step: 'checkDeleted',
      })
    }

    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'User has no password',
        step: 'checkPassword',
      })
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password)

    if (!isCorrectPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password',
        step: 'comparePassword',
        passwordLength: password.length,
        hashLength: user.password.length,
      })
    }

    // Return what NextAuth expects
    const userForNextAuth = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    }

    return NextResponse.json({
      success: true,
      message: 'Login should work',
      user: userForNextAuth,
    })
  } catch (error: any) {
    console.error('[Test Authorize] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}


