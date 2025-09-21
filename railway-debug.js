#!/usr/bin/env node

console.log('🔍 RAILWAY DEBUG INFORMATION');
console.log('============================');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Environment:', process.env.NODE_ENV);
console.log('Railway Environment:', process.env.RAILWAY_ENVIRONMENT);
console.log('Memory limit:', process.env.RAILWAY_MEMORY_LIMIT);
console.log('CPU limit:', process.env.RAILWAY_CPU_LIMIT);
console.log('Current working directory:', process.cwd());
console.log('Available memory:', Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB');

// Check if critical files exist
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'package.json',
  'next.config.js',
  'prisma/schema.prisma',
  'src/app/layout.tsx',
  'src/lib/db.ts'
];

console.log('\n📁 CRITICAL FILES CHECK:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check node_modules
const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules directory`);

if (nodeModulesExists) {
  try {
    const nextPath = path.join(process.cwd(), 'node_modules', 'next');
    const nextExists = fs.existsSync(nextPath);
    console.log(`${nextExists ? '✅' : '❌'} Next.js installed`);
    
    if (nextExists) {
      const nextPackage = require(path.join(nextPath, 'package.json'));
      console.log('Next.js version:', nextPackage.version);
    }
  } catch (error) {
    console.log('❌ Error checking Next.js:', error.message);
  }
}

console.log('\n🔧 ENVIRONMENT VARIABLES:');
const envVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV', 'PORT'];
envVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`${value ? '✅' : '❌'} ${envVar}: ${value ? '[SET]' : '[NOT SET]'}`);
});

console.log('\n✅ Debug information complete');
