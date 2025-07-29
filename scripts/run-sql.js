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

// Better SQL statement parser that handles PostgreSQL functions and triggers
function parseSQLStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let inComment = false;
  let inFunction = false;
  let braceCount = 0;
  let dollarQuote = null;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];
    
    // Handle comments
    if (char === '-' && nextChar === '-' && !inString && !inFunction) {
      inComment = true;
      continue;
    }
    if (inComment && char === '\n') {
      inComment = false;
      continue;
    }
    if (inComment) continue;
    
    // Handle dollar quoting
    if (char === '$' && !inString && !inFunction) {
      if (!dollarQuote) {
        // Start of dollar quote
        let quoteName = '$';
        let j = i + 1;
        while (j < sql.length && sql[j] !== '$') {
          quoteName += sql[j];
          j++;
        }
        if (sql[j] === '$') {
          dollarQuote = quoteName + '$';
          inString = true;
          i = j;
        }
      } else {
        // Check for end of dollar quote
        let endQuote = '';
        let j = i;
        while (j < sql.length && endQuote.length < dollarQuote.length) {
          endQuote += sql[j];
          j++;
        }
        if (endQuote === dollarQuote) {
          dollarQuote = null;
          inString = false;
          i = j - 1;
        }
      }
      currentStatement += char;
      continue;
    }
    
    // Handle regular strings
    if (char === "'" && !inFunction) {
      inString = !inString;
    }
    
    // Handle function definitions
    if (!inString && !inComment && char.toLowerCase() === 'c' && 
        sql.substring(i, i + 8).toLowerCase() === 'create or') {
      inFunction = true;
    }
    
    // Count braces in functions
    if (inFunction && char === '{') {
      braceCount++;
    }
    if (inFunction && char === '}') {
      braceCount--;
      if (braceCount === 0) {
        inFunction = false;
      }
    }
    
    // Handle statement termination
    if (char === ';' && !inString && !inComment && !inFunction) {
      currentStatement += char;
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements;
}

async function runSQLFile(filePath) {
  try {
    console.log(colorize(`Running SQL file: ${path.basename(filePath)}`, 'yellow'));
    
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Parse SQL into individual statements
    const statements = parseSQLStatements(sql);
    
    console.log(colorize(`Found ${statements.length} statements to execute`, 'cyan'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error(colorize(`Failed to execute statement ${i + 1}: ${error.message}`, 'red'));
            console.error(colorize(`SQL: ${statement.substring(0, 100)}...`, 'red'));
          } else {
            console.log(colorize(`✓ Executed statement ${i + 1}`, 'green'));
          }
        } catch (err) {
          console.error(colorize(`Error executing statement ${i + 1}: ${err.message}`, 'red'));
        }
      }
    }
    
    console.log(colorize(`✓ Completed: ${path.basename(filePath)}`, 'green'));
    
  } catch (error) {
    console.error(colorize(`Failed to run ${filePath}: ${error.message}`, 'red'));
  }
}

async function setupDatabase() {
  try {
    console.log(colorize('Setting up database schema...', 'cyan'));
    
    const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      await runSQLFile(filePath);
    }
    
    console.log(colorize('\n🎉 Database schema setup completed!', 'bright'));
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