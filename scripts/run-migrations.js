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

async function runMigrations() {
  try {
    console.log(colorize('Running database migrations...', 'cyan'));
    
    const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(colorize(`Found ${migrationFiles.length} migration files`, 'blue'));
    
    for (const file of migrationFiles) {
      console.log(colorize(`\nExecuting migration: ${file}`, 'yellow'));
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              // If exec_sql doesn't exist yet, try direct execution for the first migration
              if (file === '001_initial_schema.sql' && i === 0) {
                // For the first statement, we need to create the exec_sql function
                const createFunctionSQL = `
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
                      FOR query_result IN EXECUTE sql LOOP
                          rows_array := array_append(rows_array, to_json(query_result));
                      END LOOP;
                      
                      result := json_build_object(
                          'data', rows_array,
                          'row_count', array_length(rows_array, 1)
                      );
                      
                      RETURN result;
                  EXCEPTION
                      WHEN OTHERS THEN
                          RETURN json_build_object(
                              'error', true,
                              'message', SQLERRM,
                              'detail', SQLSTATE
                          );
                  END;
                  $$;
                  
                  GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
                  GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
                `;
                
                const { error: funcError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
                if (funcError) {
                  console.error(colorize(`Failed to create exec_sql function: ${funcError.message}`, 'red'));
                  return;
                }
                console.log(colorize('✓ Created exec_sql function', 'green'));
              }
              
              // Try the statement again
              const { error: retryError } = await supabase.rpc('exec_sql', { sql: statement });
              if (retryError) {
                console.error(colorize(`Failed to execute statement ${i + 1}: ${retryError.message}`, 'red'));
                console.error(colorize(`SQL: ${statement.substring(0, 100)}...`, 'red'));
              } else {
                console.log(colorize(`✓ Executed statement ${i + 1}`, 'green'));
              }
            } else {
              console.log(colorize(`✓ Executed statement ${i + 1}`, 'green'));
            }
          } catch (err) {
            console.error(colorize(`Error executing statement ${i + 1}: ${err.message}`, 'red'));
          }
        }
      }
      
      console.log(colorize(`✓ Completed migration: ${file}`, 'green'));
    }
    
    console.log(colorize('\n🎉 All migrations completed successfully!', 'bright'));
    
  } catch (error) {
    console.error(colorize(`Migration failed: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 