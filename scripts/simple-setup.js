#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(colorize('Error: Missing Supabase environment variables', 'red'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log(colorize('Setting up database schema...', 'cyan'));
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'migrations', '001_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log(colorize('Executing schema...', 'yellow'));
    
    // Execute the entire schema as one statement
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error(colorize(`Schema execution failed: ${error.message}`, 'red'));
      console.log(colorize('\nPlease make sure you have created the exec_sql function in your Supabase dashboard first.', 'yellow'));
      console.log(colorize('Go to your Supabase dashboard > SQL Editor and run the function creation SQL.', 'blue'));
      return;
    }
    
    console.log(colorize('✓ Schema executed successfully', 'green'));
    
    // Test the setup
    console.log(colorize('Testing database setup...', 'yellow'));
    
    const { data: testResult } = await supabase.rpc('exec_sql', { 
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 
    });
    
    if (testResult && testResult.data) {
      console.log(colorize(`✓ Found ${testResult.data.length} tables:`, 'green'));
      testResult.data.forEach(table => {
        console.log(colorize(`  - ${table.table_name}`, 'cyan'));
      });
    }
    
    console.log(colorize('\n🎉 Database setup completed successfully!', 'bright'));
    console.log(colorize('\nYou can now run:', 'cyan'));
    console.log(colorize('  npm run db:seed     # Add sample data', 'green'));
    console.log(colorize('  npm run db:query    # Interactive query runner', 'green'));
    
  } catch (error) {
    console.error(colorize(`Setup failed: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run setup
setupDatabase(); 