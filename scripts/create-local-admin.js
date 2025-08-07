#!/usr/bin/env node

// This script creates a local admin user for testing when Supabase is down
// Run with: node scripts/create-local-admin.js

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestAdmin() {
  const email = 'admin@test.com';
  const password = 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 12);
  const userId = uuidv4();
  
  console.log('Test Admin Credentials:');
  console.log('=======================');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('');
  console.log('Database Insert Commands:');
  console.log('========================');
  console.log('-- Insert into users table:');
  console.log(`INSERT INTO users (id, email, password_hash, role, email_verified, onboarding_completed, created_at)
VALUES ('${userId}', '${email}', '${passwordHash}', 'admin', true, true, NOW());`);
  console.log('');
  console.log('-- Insert into admin_profiles table:');
  console.log(`INSERT INTO admin_profiles (id, user_id, name, title, specializations, client_capacity, active_sessions, created_at, updated_at)
VALUES ('${uuidv4()}', '${userId}', 'Test Admin', 'Administrator', ARRAY['General'], 100, 0, NOW(), NOW());`);
  console.log('');
  console.log('To use these:');
  console.log('1. Go to your Supabase SQL Editor');
  console.log('2. Run the INSERT commands above');
  console.log('3. Then login with the credentials shown');
}

createTestAdmin();
