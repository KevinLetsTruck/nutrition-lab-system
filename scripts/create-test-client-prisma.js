const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient()

async function createTestClient() {
  console.log('🚀 Creating test client account using Prisma...')

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'testclient@nutritionlab.com' }
    })

    if (existing) {
      console.log('⚠️  User already exists: testclient@nutritionlab.com')
      console.log('   Password: Client123!')
      return
    }

    // Create password hash
    const password = 'Client123!'
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user with client profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          id: uuidv4(),
          email: 'testclient@nutritionlab.com',
          passwordHash: passwordHash,
          role: 'CLIENT',
          emailVerified: true,
          onboardingCompleted: true
        }
      })

      // Create client profile
      const profile = await tx.clientProfile.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          firstName: 'Test',
          lastName: 'Client',
          phone: '555-0123'
        }
      })

      return { user, profile }
    })

    console.log('✅ Created user:', result.user.email)
    console.log('✅ Created client profile')
    console.log('\n📧 Test Client Login Credentials:')
    console.log('   Email: testclient@nutritionlab.com')
    console.log('   Password: Client123!')
    console.log('\n🎉 You can now login with these credentials!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestClient()
