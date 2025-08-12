const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@fntp.com' }
    });
    
    if (existingUser) {
      console.log('User already exists');
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@fntp.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'PRACTITIONER'
      }
    });
    
    console.log('User created successfully:', user.email);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
