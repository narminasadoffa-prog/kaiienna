import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'admin@kaiienna.az'
  const password = 'Admin2024!'

  console.log('🔍 Testing login credentials...\n')

  try {
    // 1. Check if user exists
    console.log('1. Checking if user exists...')
    const user = await prisma.user.findFirst({
      where: {
        email,
        OR: [
          { deletedAt: null },
          { deletedAt: undefined },
        ],
      },
    })

    if (!user) {
      console.error('❌ User not found!')
      console.log('\n💡 Solution: Run npm run create-admin')
      process.exit(1)
    }

    console.log('✅ User found:')
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Has password:', !!user.password)
    console.log('   Password length:', user.password?.length || 0)

    // 2. Check password
    if (!user.password) {
      console.error('\n❌ User has no password!')
      console.log('\n💡 Solution: Run npm run create-admin')
      process.exit(1)
    }

    console.log('\n2. Testing password...')
    const isCorrect = await bcrypt.compare(password, user.password)

    if (isCorrect) {
      console.log('✅ Password is correct!')
      console.log('\n✅ Login should work!')
    } else {
      console.error('❌ Password is incorrect!')
      console.log('\n💡 Solution: Run npm run create-admin to reset password')
      process.exit(1)
    }

    // 3. Check what NextAuth will receive
    console.log('\n3. User object for NextAuth:')
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    })

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    if (error.message?.includes('DATABASE_URL')) {
      console.error('\n💡 Solution: Check .env file has DATABASE_URL')
    }
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


