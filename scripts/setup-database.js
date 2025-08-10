const { execSync } = require('child_process');

console.log('🚀 Setting up database...');

try {
  // Push schema to create tables
  console.log('📊 Creating database tables...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Run seed
  console.log('🌱 Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}
