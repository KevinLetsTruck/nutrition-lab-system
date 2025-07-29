#!/usr/bin/env node

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

async function createTables() {
  try {
    console.log(colorize('Creating database tables...', 'cyan'));
    
    // Test connection
    console.log(colorize('Testing connection...', 'yellow'));
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (testError) {
      console.error(colorize(`Connection test failed: ${testError.message}`, 'red'));
      return;
    }
    
    console.log(colorize('✓ Connection successful', 'green'));
    
    // Create sample data to test the system
    console.log(colorize('Creating sample data...', 'yellow'));
    
    // Insert sample clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert([
        {
          email: 'john.doe@example.com',
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1985-03-15'
        },
        {
          email: 'jane.smith@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          date_of_birth: '1990-07-22'
        },
        {
          email: 'mike.johnson@example.com',
          first_name: 'Mike',
          last_name: 'Johnson',
          date_of_birth: '1978-11-08'
        }
      ])
      .select();
    
    if (clientsError) {
      console.error(colorize(`Failed to create clients: ${clientsError.message}`, 'red'));
    } else {
      console.log(colorize(`✓ Created ${clients.length} clients`, 'green'));
    }
    
    // Test querying the data
    console.log(colorize('Testing data retrieval...', 'yellow'));
    
    const { data: allClients, error: queryError } = await supabase
      .from('clients')
      .select('*');
    
    if (queryError) {
      console.error(colorize(`Query failed: ${queryError.message}`, 'red'));
    } else {
      console.log(colorize(`✓ Retrieved ${allClients.length} clients`, 'green'));
      allClients.forEach(client => {
        console.log(colorize(`  - ${client.first_name} ${client.last_name} (${client.email})`, 'cyan'));
      });
    }
    
    console.log(colorize('\n🎉 Database setup completed!', 'bright'));
    console.log(colorize('\nYou can now run:', 'cyan'));
    console.log(colorize('  npm run db:query    # Interactive query runner', 'green'));
    
  } catch (error) {
    console.error(colorize(`Setup failed: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run setup
createTables(); 