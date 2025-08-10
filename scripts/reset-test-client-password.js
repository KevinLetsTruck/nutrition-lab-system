const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetTestClientPassword() {
  console.log('🔑 Resetting test client password...')

  try {
    // Create new password hash
    const password = 'Client123!'
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user password
    const user = await prisma.user.update({
      where: { email: 'testclient@nutritionlab.com' },
      data: { passwordHash }
    })

    console.log('✅ Password reset for:', user.email)
    console.log('\n📧 Login Credentials:')
    console.log('   Email: testclient@nutritionlab.com')
    console.log('   Password: Client123!')

    // Also check kevin@letstruck.com
    const kevin = await prisma.user.findUnique({
      where: { email: 'kevin@letstruck.com' }
    })

    if (kevin) {
      console.log('\n📧 Note: kevin@letstruck.com exists but you need to remember the password you set when registering.')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

resetTestClientPassword()
