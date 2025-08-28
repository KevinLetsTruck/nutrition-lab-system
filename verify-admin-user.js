const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyAdminUser() {
  console.log('🔍 Verifying admin user...');
  
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@fntp.dev' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      console.log('🔧 Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@fntp.dev',
          name: 'Test Admin',
          password: hashedPassword,
          role: 'ADMIN',
        }
      });
      
      console.log('✅ Admin user created:', newAdmin.email);
    } else {
      console.log('✅ Admin user found:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.createdAt}`);
      
      // Test password verification
      const passwordValid = await bcrypt.compare('admin123', admin.password);
      console.log(`   Password valid: ${passwordValid ? '✅' : '❌'}`);
      
      if (!passwordValid) {
        console.log('🔧 Updating password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
          where: { id: admin.id },
          data: { password: hashedPassword }
        });
        console.log('✅ Password updated');
      }
    }
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('📧 Email: admin@fntp.dev');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminUser();
