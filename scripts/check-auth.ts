import { prisma } from '../lib/prisma'

async function main() {
  console.log('🔍 Checking authentication setup...\n')

  // 1. Check database connection
  console.log('1. Checking database connection...')
  try {
    await prisma.$connect()
    console.log('   ✅ Database connected')
  } catch (error: any) {
    console.error('   ❌ Database connection failed:', error.message)
    console.error('\n   💡 Solution:')
    console.error('   - Make sure PostgreSQL is running')
    console.error('   - Check DATABASE_URL in .env.local')
    console.error('   - Run: npm run db:push')
    process.exit(1)
  }

  // 2. Check if admin user exists
  console.log('\n2. Checking admin user...')
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@kaiienna.az'
  const admin = await prisma.user.findFirst({
    where: {
      email: adminEmail,
      role: 'ADMIN',
      OR: [
        { deletedAt: null },
        { deletedAt: undefined },
      ],
    },
  })

  if (admin) {
    console.log('   ✅ Admin user exists')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Has password: ${admin.password ? 'Yes' : 'No'}`)
  } else {
    console.error('   ❌ Admin user not found')
    console.error('\n   💡 Solution:')
    console.error('   Run: npm run create-admin')
    process.exit(1)
  }

  // 3. Check NEXTAUTH_SECRET
  console.log('\n3. Checking NEXTAUTH_SECRET...')
  const secret = process.env.NEXTAUTH_SECRET
  if (secret) {
    console.log('   ✅ NEXTAUTH_SECRET is set')
  } else {
    console.error('   ❌ NEXTAUTH_SECRET is missing')
    console.error('\n   💡 Solution:')
    console.error('   Add to .env.local:')
    console.error('   NEXTAUTH_SECRET=dev-secret-key-12345')
    process.exit(1)
  }

  // 4. Check NEXTAUTH_URL
  console.log('\n4. Checking NEXTAUTH_URL...')
  const url = process.env.NEXTAUTH_URL
  if (url) {
    console.log(`   ✅ NEXTAUTH_URL is set: ${url}`)
  } else {
    console.error('   ⚠️  NEXTAUTH_URL is missing (optional but recommended)')
    console.error('\n   💡 Solution:')
    console.error('   Add to .env.local:')
    console.error('   NEXTAUTH_URL=http://localhost:3007')
  }

  console.log('\n✅ All checks passed! Authentication should work.')
  console.log('\n📋 Login credentials:')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin2024!'}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


