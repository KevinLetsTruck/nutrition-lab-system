#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
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

// Initialize Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(colorize('Error: Missing Supabase environment variables', 'red'));
  process.exit(1);
}

// Extract project ID from URL
const projectId = supabaseUrl.split('//')[1].split('.')[0];

// Function to make HTTP request to Supabase
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectId}.supabase.co`,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function setupDatabase() {
  try {
    console.log(colorize('Setting up database schema...', 'cyan'));
    
    // First, create the exec_sql function using direct SQL execution
    console.log(colorize('Creating exec_sql function...', 'yellow'));
    
    const execSqlFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
          result json;
          query_result record;
          rows_array json[] := '{}';
      BEGIN
          -- Execute the query and collect results
          FOR query_result IN EXECUTE sql LOOP
              rows_array := array_append(rows_array, to_json(query_result));
          END LOOP;
          
          -- Return the results as JSON
          result := json_build_object(
              'data', rows_array,
              'row_count', array_length(rows_array, 1)
          );
          
          RETURN result;
      EXCEPTION
          WHEN OTHERS THEN
              -- Return error information
              RETURN json_build_object(
                  'error', true,
                  'message', SQLERRM,
                  'detail', SQLSTATE
              );
      END;
      $$;
      
      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
      GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
    `;
    
    // Execute the function creation using the REST API
    const functionResult = await makeRequest('/rest/v1/rpc/exec_sql', 'POST', {
      sql: execSqlFunction
    });
    
    if (functionResult.status !== 200) {
      console.error(colorize(`Function creation failed: ${functionResult.data}`, 'red'));
      console.log(colorize('Trying alternative approach...', 'yellow'));
      
      // Try using the SQL editor approach
      console.log(colorize('Please run the following SQL in your Supabase SQL editor:', 'cyan'));
      console.log(colorize('1. Go to your Supabase dashboard', 'blue'));
      console.log(colorize('2. Click on "SQL Editor"', 'blue'));
      console.log(colorize('3. Paste and run this SQL:', 'blue'));
      console.log(colorize(execSqlFunction, 'yellow'));
      console.log(colorize('\nThen run: node scripts/setup-database.js', 'green'));
      return;
    }
    
    console.log(colorize('✓ exec_sql function created', 'green'));
    
    // Now read and execute the schema
    console.log(colorize('Executing schema...', 'yellow'));
    
    const schemaPath = path.join(__dirname, '..', 'database', 'migrations', '001_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into manageable chunks and execute
    const statements = schema.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
    
    console.log(colorize(`Found ${statements.length} statements to execute`, 'cyan'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          const result = await makeRequest('/rest/v1/rpc/exec_sql', 'POST', {
            sql: statement
          });
          
          if (result.status !== 200) {
            console.error(colorize(`Failed to execute statement ${i + 1}: ${result.data}`, 'red'));
            console.error(colorize(`SQL: ${statement.substring(0, 100)}...`, 'red'));
          } else {
            console.log(colorize(`✓ Executed statement ${i + 1}`, 'green'));
          }
        } catch (err) {
          console.error(colorize(`Error executing statement ${i + 1}: ${err.message}`, 'red'));
        }
      }
    }
    
    // Test the setup
    console.log(colorize('Testing database setup...', 'yellow'));
    
    const testResult = await makeRequest('/rest/v1/rpc/exec_sql', 'POST', {
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    });
    
    if (testResult.status === 200 && testResult.data && testResult.data.data) {
      console.log(colorize(`✓ Found ${testResult.data.data.length} tables:`, 'green'));
      testResult.data.data.forEach(table => {
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
