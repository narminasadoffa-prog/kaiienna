import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks = {
    database: {
      connected: false,
      error: null as string | null,
      userCount: 0,
    },
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
    },
    admin: {
      exists: false,
      email: process.env.ADMIN_EMAIL || 'admin@kaiienna.az',
      error: null as string | null,
    },
  }

  // Check database connection
  try {
    await prisma.$connect()
    checks.database.connected = true
    checks.database.userCount = await prisma.user.count()
  } catch (error: any) {
    checks.database.connected = false
    checks.database.error = error.message
  }

  // Check admin user
  if (checks.database.connected) {
    try {
      const admin = await prisma.user.findFirst({
        where: {
          email: checks.admin.email,
          role: 'ADMIN',
          OR: [
            { deletedAt: null },
            { deletedAt: undefined },
          ],
        },
      })
      checks.admin.exists = !!admin
    } catch (error: any) {
      checks.admin.error = error.message
    }
  } else {
    checks.admin.error = 'Database not connected'
  }

  const allGood = 
    checks.database.connected &&
    checks.env.hasNextAuthSecret &&
    checks.admin.exists

  return NextResponse.json({
    status: allGood ? 'ok' : 'error',
    checks,
    recommendations: [
      !checks.env.hasDatabaseUrl && 'Add DATABASE_URL to .env.local',
      !checks.env.hasNextAuthSecret && 'Add NEXTAUTH_SECRET to .env.local',
      !checks.database.connected && 'Check DATABASE_URL and ensure PostgreSQL is running',
      !checks.admin.exists && checks.database.connected && 'Run: npm run create-admin',
    ].filter(Boolean),
  }, {
    status: allGood ? 200 : 500,
  })
}


