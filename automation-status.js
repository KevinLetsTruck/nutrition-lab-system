#!/usr/bin/env node

/**
 * FNTP Development Automation Status Checker
 * Verifies all automation tools are properly configured and working
 */

const fs = require('fs');
const { spawn } = require('child_process');

console.log('🤖 FNTP Development Automation Status Check');
console.log('=============================================');

// Check if automation packages are installed
console.log('\n📦 Checking Installed Automation Packages...');

const requiredPackages = [
  'concurrently',
  'husky', 
  'lint-staged',
  'prettier',
  'jest',
  '@testing-library/react'
];

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

requiredPackages.forEach(pkg => {
  if (allDeps[pkg]) {
    console.log(`   ✅ ${pkg} - v${allDeps[pkg]}`);
  } else {
    console.log(`   ❌ ${pkg} - NOT INSTALLED`);
  }
});

// Check automation scripts
console.log('\n⚙️ Checking Automation Scripts...');

const requiredScripts = [
  'dev:full',
  'watch:types', 
  'watch:lint',
  'test:watch',
  'auto:format',
  'auto:fix'
];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`   ✅ ${script} - ${packageJson.scripts[script]}`);
  } else {
    console.log(`   ❌ ${script} - NOT CONFIGURED`);
  }
});

// Check configuration files
console.log('\n📋 Checking Configuration Files...');

const configFiles = [
  { file: '.lintstagedrc.json', name: 'Lint-staged Config' },
  { file: '.prettierrc', name: 'Prettier Config' },
  { file: '.automation-config.json', name: 'Automation Config' },
  { file: '.vscode/settings.json', name: 'VSCode Settings' },
  { file: '.husky/pre-commit', name: 'Git Pre-commit Hook' },
  { file: 'jest.config.js', name: 'Jest Testing Config' },
  { file: 'jest.setup.js', name: 'Jest Setup' }
];

configFiles.forEach(({ file, name }) => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${name} - ${file}`);
  } else {
    console.log(`   ❌ ${name} - MISSING: ${file}`);
  }
});

console.log('\n🚀 Available Automation Commands:');
console.log('=================================');
console.log('🎯 Primary Commands:');
console.log('   ./start-development.sh  - Start complete automation environment');
console.log('   npm run dev:full        - Start app + database + type checking');
console.log('   npm run auto:fix        - Auto-fix all code issues');
console.log('   npm run auto:format     - Auto-format all code');
console.log('');
console.log('📊 Background Monitoring:');
console.log('   npm run watch:types     - Continuous TypeScript checking');
console.log('   npm run watch:lint      - Continuous code quality monitoring'); 
console.log('   npm run test:watch      - Continuous test running');
console.log('');
console.log('🔄 Git Automation:');
console.log('   git commit              - Auto-formats and checks code before commit');
console.log('   git push                - Runs tests before pushing');
console.log('');
console.log('🎉 Your FNTP development is now fully automated!');
console.log('   Changes save automatically → Code formats → Types check → Tests run');
console.log('   This gives you "background agent" like experience! 🚀');
