#!/usr/bin/env node

/**
 * Database setup script for Nutrition Lab Management System
 * This script helps set up the initial database schema
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up database for Nutrition Lab Management System...')

// Read the migration file
const migrationPath = path.join(__dirname, '../database/migrations/001_initial_schema.sql')
const migrationContent = fs.readFileSync(migrationPath, 'utf8')

console.log('📄 Migration file loaded successfully')
console.log('📋 Migration content preview:')
console.log(migrationContent.substring(0, 200) + '...')

console.log('\n✅ Database setup script ready!')
console.log('\n📝 Next steps:')
console.log('1. Create a Supabase project at https://supabase.com')
console.log('2. Copy your project URL and anon key to .env.local')
console.log('3. Run the migration in your Supabase SQL editor:')
console.log(`   ${migrationPath}`)
console.log('4. Set up storage buckets for file uploads')
console.log('5. Configure authentication settings')

console.log('\n🔧 Manual setup required:')
console.log('- Run the SQL migration in Supabase dashboard')
console.log('- Create storage buckets: uploads, pdfs, images')
console.log('- Set up storage policies')
console.log('- Configure authentication providers')
