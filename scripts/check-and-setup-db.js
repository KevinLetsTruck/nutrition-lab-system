const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function checkAndSetupDatabase() {
  try {
    // Try to query the users table
    console.log('🔍 Checking database...');
    await prisma.user.count();
    console.log('✅ Database is ready!');
  } catch (error) {
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      console.log('📊 Database tables not found. Setting up...');
      
      try {
        // Push schema
        console.log('Creating tables...');
        execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
        
        // Run seed
        console.log('Seeding data...');
        execSync('npx prisma db seed', { stdio: 'inherit' });
        
        console.log('✅ Database setup complete!');
      } catch (setupError) {
        console.error('❌ Database setup failed:', setupError.message);
        // Continue anyway - the app might work without seed data
      }
    } else {
      console.error('❌ Database connection error:', error.message);
      // Continue anyway - let the app handle the error
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAndSetupDatabase().catch(console.error);
