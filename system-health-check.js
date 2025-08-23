const fs = require('fs');
const path = require('path');

console.log('🏥 FNTP System Health Check\n');
console.log('=' .repeat(50));

// Check critical directories
const criticalDirs = [
  'lib/assessment',
  'lib/ai',
  'src/app/api/assessment',
  'prisma',
  'components/assessment'
];

console.log('\n📁 Critical Directories:');
criticalDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
});

// Check environment variables
console.log('\n🔐 Environment Variables:');
const envVars = [
  'DATABASE_URL',
  'ANTHROPIC_API_KEY',
  'GOOGLE_CLOUD_API_KEY',
  'S3_ACCESS_KEY_ID',
  'CLOUDINARY_API_KEY'
];

require('dotenv').config({ path: '.env.local' });
envVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? (value.includes('your-') || value.includes('placeholder') ? '⚠️  (placeholder)' : '✅') : '❌';
  console.log(`  ${status} ${varName}`);
});

// Check package.json scripts
console.log('\n📦 Package Scripts:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const importantScripts = ['dev', 'build', 'db:migrate', 'test:assessment-ai'];
importantScripts.forEach(script => {
  const exists = packageJson.scripts[script];
  console.log(`  ${exists ? '✅' : '❌'} ${script}`);
});

// Check TypeScript config
console.log('\n⚙️  TypeScript Configuration:');
const tsConfigExists = fs.existsSync('tsconfig.json');
console.log(`  ${tsConfigExists ? '✅' : '❌'} tsconfig.json exists`);

// Check Prisma schema
console.log('\n🗄️  Database Schema:');
const schemaPath = 'prisma/schema.prisma';
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const models = ['ClientAssessment', 'AssessmentTemplate', 'ClientResponse', 'AssessmentAnalysis'];
  models.forEach(model => {
    const exists = schema.includes(`model ${model}`);
    console.log(`  ${exists ? '✅' : '❌'} ${model} model`);
  });
}

console.log('\n' + '=' .repeat(50));
console.log('✨ Health check complete!\n');
