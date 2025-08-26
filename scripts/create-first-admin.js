#!/usr/bin/env node

/**
 * Create First Admin User Script
 * Run this after deployment to create your first admin user
 */

const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  console.log('🚀 FNTP Daily Workflow - Create First Admin User\n');

  try {
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    if (!name || !email || !password) {
      console.log('❌ All fields are required');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('\n📋 SQL Query to run in your database:\n');
    console.log('---');
    console.log(`INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")`);
    console.log(`VALUES (`);
    console.log(`  'admin_${Date.now()}',`);
    console.log(`  '${email}',`);
    console.log(`  '${name}',`);
    console.log(`  '${hashedPassword}',`);
    console.log(`  'ADMIN',`);
    console.log(`  NOW(),`);
    console.log(`  NOW()`);
    console.log(`);`);
    console.log('---\n');

    console.log('✅ Copy and paste this SQL into your production database');
    console.log(`   Then login at: https://your-app.vercel.app/login`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  rl.close();
}

createAdmin();
