import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@kaiienna.az'
  const password = process.env.ADMIN_PASSWORD || 'Admin2024!'
  const name = process.env.ADMIN_NAME || 'Admin'
  
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin created successfully!')
  console.log('Email:', admin.email)
  console.log('Password:', password)
  console.log('Role:', admin.role)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


