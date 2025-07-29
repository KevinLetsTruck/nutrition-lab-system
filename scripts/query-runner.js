#!/usr/bin/env node

const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(colors.red + 'Error: Missing Supabase environment variables' + colors.reset);
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

function printTable(data, title = '') {
  if (!data || data.length === 0) {
    console.log(colorize('No data found', 'yellow'));
    return;
  }

  if (title) {
    console.log(colorize(`\n${title}`, 'cyan'));
    console.log(colorize('='.repeat(title.length), 'cyan'));
  }

  const columns = Object.keys(data[0]);
  const columnWidths = {};
  
  // Calculate column widths
  columns.forEach(col => {
    columnWidths[col] = Math.max(
      col.length,
      ...data.map(row => String(row[col] || '').length)
    );
  });

  // Print header
  const header = columns.map(col => col.padEnd(columnWidths[col])).join(' | ');
  console.log(colorize(header, 'bright'));
  console.log(colorize('-'.repeat(header.length), 'blue'));

  // Print rows
  data.forEach(row => {
    const rowStr = columns.map(col => {
      const value = String(row[col] || '');
      return value.padEnd(columnWidths[col]);
    }).join(' | ');
    console.log(rowStr);
  });

  console.log(colorize(`\n${data.length} row(s) returned`, 'green'));
}

function printError(error) {
  console.error(colorize(`\nError: ${error.message}`, 'red'));
  if (error.details) {
    console.error(colorize(`Details: ${error.details}`, 'red'));
  }
  if (error.hint) {
    console.error(colorize(`Hint: ${error.hint}`, 'yellow'));
  }
}

// Predefined queries
const predefinedQueries = {
  tables: `
    SELECT 
      table_name,
      table_type
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `,
  
  clients: `
    SELECT 
      id,
      first_name,
      last_name,
      email,
      date_of_birth,
      created_at
    FROM clients 
    ORDER BY last_name, first_name 
    LIMIT 20
  `,
  
  reports: `
    SELECT 
      lr.id,
      c.first_name,
      c.last_name,
      lr.report_type,
      lr.report_date,
      lr.status,
      lr.created_at
    FROM lab_reports lr
    JOIN clients c ON lr.client_id = c.id
    ORDER BY lr.created_at DESC 
    LIMIT 20
  `,
  
  queue: `
    SELECT 
      id,
      task_type,
      status,
      priority,
      created_at,
      started_at,
      completed_at
    FROM processing_queue 
    ORDER BY priority DESC, created_at ASC 
    LIMIT 20
  `,
  
  summary: `
    SELECT 
      c.first_name,
      c.last_name,
      COUNT(lr.id) as total_reports,
      COUNT(CASE WHEN lr.status = 'completed' THEN 1 END) as completed_reports,
      COUNT(CASE WHEN lr.status = 'pending' THEN 1 END) as pending_reports
    FROM clients c
    LEFT JOIN lab_reports lr ON c.id = lr.client_id
    GROUP BY c.id, c.first_name, c.last_name
    ORDER BY total_reports DESC
  `
};

// Command handlers
async function handleTables() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: predefinedQueries.tables });
    if (error) throw error;
    printTable(data, 'Database Tables');
  } catch (error) {
    printError(error);
  }
}

async function handleClients() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: predefinedQueries.clients });
    if (error) throw error;
    printTable(data, 'Clients');
  } catch (error) {
    printError(error);
  }
}

async function handleReports() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: predefinedQueries.reports });
    if (error) throw error;
    printTable(data, 'Lab Reports');
  } catch (error) {
    printError(error);
  }
}

async function handleQueue() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: predefinedQueries.queue });
    if (error) throw error;
    printTable(data, 'Processing Queue');
  } catch (error) {
    printError(error);
  }
}

async function handleSummary() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: predefinedQueries.summary });
    if (error) throw error;
    printTable(data, 'Client Summary');
  } catch (error) {
    printError(error);
  }
}

async function handleDescribe(tableName) {
  if (!tableName) {
    console.error(colorize('Usage: desc <table_name>', 'yellow'));
    return;
  }

  try {
    const sql = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
      ORDER BY ordinal_position
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    printTable(data, `Table Structure: ${tableName}`);
  } catch (error) {
    printError(error);
  }
}

async function handleCustomQuery(sql) {
  if (!sql) {
    console.error(colorize('Please provide a SQL query', 'yellow'));
    return;
  }

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    printTable(data, 'Query Results');
  } catch (error) {
    printError(error);
  }
}

async function handleFileQuery(filePath) {
  const fs = require('fs');
  const path = require('path');

  if (!filePath) {
    console.error(colorize('Usage: file <path_to_sql_file>', 'yellow'));
    return;
  }

  try {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(colorize(`File not found: ${fullPath}`, 'red'));
      return;
    }

    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log(colorize(`Executing SQL from: ${fullPath}`, 'cyan'));
    console.log(colorize('SQL:', 'blue'));
    console.log(sql);
    console.log();

    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    printTable(data, 'File Query Results');
  } catch (error) {
    printError(error);
  }
}

function showHelp() {
  console.log(colorize('\nNutrition Lab Database Query Runner', 'bright'));
  console.log(colorize('====================================', 'cyan'));
  console.log();
  console.log(colorize('Commands:', 'bright'));
  console.log('  tables                    - Show all database tables');
  console.log('  clients                   - Show clients (first 20)');
  console.log('  reports                   - Show lab reports (first 20)');
  console.log('  queue                     - Show processing queue (first 20)');
  console.log('  summary                   - Show client summary');
  console.log('  desc <table>              - Describe table structure');
  console.log('  file <path>               - Execute SQL from file');
  console.log('  help                      - Show this help');
  console.log('  exit, quit                - Exit the program');
  console.log();
  console.log(colorize('Direct SQL:', 'bright'));
  console.log('  Any other input will be executed as SQL query');
  console.log();
  console.log(colorize('Examples:', 'bright'));
  console.log('  SELECT * FROM clients LIMIT 5;');
  console.log('  desc lab_reports');
  console.log('  file ./queries/client_report.sql');
  console.log();
}

// Main interactive loop
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize('db> ', 'green')
  });

  console.log(colorize('\nWelcome to Nutrition Lab Database Query Runner!', 'bright'));
  console.log(colorize('Type "help" for available commands\n', 'cyan'));

  rl.prompt();

  rl.on('line', async (input) => {
    const command = input.trim();

    if (!command) {
      rl.prompt();
      return;
    }

    try {
      if (command === 'exit' || command === 'quit') {
        console.log(colorize('Goodbye!', 'green'));
        rl.close();
        return;
      }

      if (command === 'help') {
        showHelp();
      } else if (command === 'tables') {
        await handleTables();
      } else if (command === 'clients') {
        await handleClients();
      } else if (command === 'reports') {
        await handleReports();
      } else if (command === 'queue') {
        await handleQueue();
      } else if (command === 'summary') {
        await handleSummary();
      } else if (command.startsWith('desc ')) {
        const tableName = command.substring(5).trim();
        await handleDescribe(tableName);
      } else if (command.startsWith('file ')) {
        const filePath = command.substring(5).trim();
        await handleFileQuery(filePath);
      } else {
        // Treat as custom SQL query
        await handleCustomQuery(command);
      }
    } catch (error) {
      printError(error);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

// Handle command line arguments
if (process.argv.length > 2) {
  const command = process.argv[2];
  
  if (command === 'tables') {
    handleTables().then(() => process.exit(0));
  } else if (command === 'clients') {
    handleClients().then(() => process.exit(0));
  } else if (command === 'reports') {
    handleReports().then(() => process.exit(0));
  } else if (command === 'queue') {
    handleQueue().then(() => process.exit(0));
  } else if (command === 'summary') {
    handleSummary().then(() => process.exit(0));
  } else if (command === 'test') {
    // Test connection
    supabase.from('clients').select('count').limit(1)
      .then(() => {
        console.log(colorize('Database connection successful!', 'green'));
        process.exit(0);
      })
      .catch(error => {
        console.error(colorize(`Connection failed: ${error.message}`, 'red'));
        process.exit(1);
      });
  } else {
    console.error(colorize(`Unknown command: ${command}`, 'red'));
    console.log(colorize('Available commands: tables, clients, reports, queue, summary, test', 'yellow'));
    process.exit(1);
  }
} else {
  // Start interactive mode
  main().catch(error => {
    console.error(colorize(`Fatal error: ${error.message}`, 'red'));
    process.exit(1);
  });
} 